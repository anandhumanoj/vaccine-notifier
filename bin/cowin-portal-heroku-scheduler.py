import os
import subprocess
from apscheduler.schedulers.blocking import BlockingScheduler

exec_interval = os.environ.get('HEROKU_SCHEDULER_EXEC_INTERVAL', '')
exec_interval = int(exec_interval) if exec_interval.isdigit() else 60

sched = BlockingScheduler()

@sched.scheduled_job('interval', seconds = exec_interval)
def cowin_portal_notifier():
    subprocess.run(["node", "bin/cowin-portal.js"])

sched.start()