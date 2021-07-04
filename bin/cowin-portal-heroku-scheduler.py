import subprocess
from apscheduler.schedulers.blocking import BlockingScheduler


sched = BlockingScheduler()

@sched.scheduled_job('interval', seconds=48)
def cowin_portal_notifier():
    subprocess.run(["node", "bin/cowin-portal.js"])

sched.start()