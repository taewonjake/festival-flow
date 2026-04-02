import json
import os
from datetime import datetime, timezone

import pymysql


def get_conn():
    return pymysql.connect(
        host=os.environ["DB_HOST"],
        port=int(os.environ.get("DB_PORT", "3306")),
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        database=os.environ["DB_NAME"],
        connect_timeout=int(os.environ.get("DB_CONNECT_TIMEOUT_SEC", "5")),
        autocommit=True,
    )


def upsert_snapshot(
    cur,
    event_id,
    total_waiting,
    tables_in_use,
    total_tables,
    called_users,
    completed_today,
):
    cur.execute(
        """
        INSERT INTO dashboard_stats_snapshot
        (event_id, total_waiting, tables_in_use, total_tables, called_users, completed_today, aggregated_at)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
        ON DUPLICATE KEY UPDATE
          total_waiting=VALUES(total_waiting),
          tables_in_use=VALUES(tables_in_use),
          total_tables=VALUES(total_tables),
          called_users=VALUES(called_users),
          completed_today=VALUES(completed_today),
          aggregated_at=VALUES(aggregated_at)
        """,
        (
            event_id,
            total_waiting,
            tables_in_use,
            total_tables,
            called_users,
            completed_today,
            datetime.now(timezone.utc).replace(tzinfo=None),
        ),
    )


def lambda_handler(event, context):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM events ORDER BY id ASC")
            event_ids = [row[0] for row in cur.fetchall()]

            if not event_ids:
                return {"statusCode": 200, "body": json.dumps({"message": "no events"})}

            for event_id in event_ids:
                cur.execute(
                    "SELECT COUNT(*) FROM waitings WHERE event_id=%s AND status='WAITING'",
                    (event_id,),
                )
                total_waiting = cur.fetchone()[0]

                cur.execute(
                    "SELECT COUNT(*) FROM tables WHERE event_id=%s AND status='OCCUPIED'",
                    (event_id,),
                )
                tables_in_use = cur.fetchone()[0]

                cur.execute("SELECT COUNT(*) FROM tables WHERE event_id=%s", (event_id,))
                total_tables = cur.fetchone()[0]

                cur.execute(
                    "SELECT COUNT(*) FROM waitings WHERE event_id=%s AND status='CALLED'",
                    (event_id,),
                )
                called_users = cur.fetchone()[0]

                cur.execute(
                    """
                    SELECT COUNT(*) FROM waitings
                    WHERE event_id=%s AND status='ARRIVED' AND created_at >= CURDATE()
                    """,
                    (event_id,),
                )
                completed_today = cur.fetchone()[0]

                upsert_snapshot(
                    cur,
                    event_id,
                    total_waiting,
                    tables_in_use,
                    total_tables,
                    called_users,
                    completed_today,
                )

        return {"statusCode": 200, "body": json.dumps({"message": "snapshot updated"})}
    finally:
        conn.close()
