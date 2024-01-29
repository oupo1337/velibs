FROM sqitch/sqitch:v1.4.0

COPY sqitch.conf sqitch.plan /etc/database/
COPY deploy /etc/database/deploy
COPY revert /etc/database/revert
COPY verify /etc/database/verify

WORKDIR /etc/database

ENTRYPOINT ["sqitch", "deploy"]