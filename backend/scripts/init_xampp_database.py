import argparse

import pymysql


def main(host: str, port: int, user: str, password: str, database: str) -> None:
    connection = pymysql.connect(host=host, port=port, user=user, password=password, charset="utf8mb4")
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS `{database}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
        connection.commit()
    finally:
        connection.close()
    print(f"database={database} host={host}:{port} status=ready")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=3306)
    parser.add_argument("--user", default="root")
    parser.add_argument("--password", default="")
    parser.add_argument("--database", default="insurance_ai_copilot")
    args = parser.parse_args()
    main(args.host, args.port, args.user, args.password, args.database)

