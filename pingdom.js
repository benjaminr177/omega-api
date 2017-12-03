const credentials = {
  user: process.env.P_USER || 'hostmaster@appgyver.com',
  pass: process.env.P_PASS || 'lolcatisappgyvercat',
  appkey: process.env.P_APP_KEY || 'u0xcts0z84rfrc4lw95ip7to3x754a81'
}

const baseUrl = process.env.BASE_URL || 'http://localhost:8080/'
const flowdock = require('./flowdock')
const fetch = require('node-fetch')
const p = require('pingdom-api')
const pingdom = p(credentials)

let statuses = []
let hasMessageBeenSentBefore = {}

function checkStatuses () {
  console.log(statuses)

  if (statuses.length > 0) {
    statuses = []

    fetch(baseUrl + 'down', {
      method: 'POST'
    })
  } else {
    fetch(baseUrl + 'up', {
      method: 'POST'
    })
    statuses = []
  }
}

function ping () {
  pingdom.checks((err, checks) => {
    if (err) throw err
    console.log(hasMessageBeenSentBefore)

    checks.forEach((check) => {
      var name = check.name
      var status = check.status
      var currentTime = Math.round(new Date() / 1000)

      if (status === 'down' && !name.includes('usetrace')) {
        statuses.push(status)

        if (!hasMessageBeenSentBefore.hasOwnProperty(name)) {
          hasMessageBeenSentBefore[name] = currentTime
          flowdock.notification(name)
          flowdock.message(name)
        }
      }

      // Here the time between each notification can be changed
      if (currentTime - hasMessageBeenSentBefore[name] > 600) {
        console.log('DELETED')
        delete hasMessageBeenSentBefore[name]
      }
    })
  })
}

// because js doesn't have sleep()
setInterval(() => {
  ping()
  checkStatuses()
}, 4000)
