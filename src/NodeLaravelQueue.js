const Serialize = require('php-serialize');
const EventEmitter = require('events');
const tools = require('./tools');

class Queue extends EventEmitter {
  constructor({
    driver = 'redis',
    client,
    winston,
    scope = {},
    queue = 'default',
    appname = 'laravel',
    prefix = '_database_',
    isQueueNotify = true,
  }) {
    super();
    this.driver = driver;
    this.client = client;
    this.winston = winston;
    this.isQueueNotify = isQueueNotify;
    this.scope = scope;
    this.appname = appname;
    this.prefix = prefix;
    this.queue = queue;
  }

  listen() {
    switch (this.driver) {
      case 'redis':
        this.redisPop();
        break;
    }
  }


  push(name, object) {
    switch (this.driver) {
      case 'redis':
        this.redisPush(name, object);
        break;
    }
  }

  redisPop() {
    const pop = () => {
      this.client.blpop(this.appname + this.prefix + 'queues:' + this.queue, 60000, (err, replay) => {
        if (err) {
          this.winston.error(`Error node-laravel-queue ${err}`);
          console.error(`Error node-laravel-queue ${err}`);
          return;
        }
        if (replay?.[1] == undefined) {
          this.winston.error(`Queue: ${this.appname + this.prefix + 'queues:' + this.queue}. Error node-laravel-queue Empty Redis info : ${replay}`);
          console.error(`Error node-laravel-queue Empty Redis info : ${replay}`);
          return;
        }
        const obj = JSON.parse(replay[1]);
        const command = obj.data.command;
        if (this.scope.hasOwnProperty(obj.data.commandName) === false) {
          this.winston.error(`Error node-laravel-queue Scope ${obj.data.commandName} not found`);
          console.error(`Error node-laravel-queue Scope ${obj.data.commandName} not found`);
          return;
        }
        const raw = Serialize.unserialize(command, this.scope);
        this.emit('job', {name: obj.data.commandName, data: raw});
        if (this.isQueueNotify === true) {
          this.client.blpop(this.appname + this.prefix + 'queues:' + this.queue + ':notify', 60000, (err, replay) => {
          });
        }
        pop();
      });
    };
    pop();
  }

  redisPush(name, object, timeout = null, delay = null) {
    const command = Serialize.serialize(object, this.scope);

    let data = {
      job: 'Illuminate\\Queue\\CallQueuedHandler@call',
      data: {
        commandName: name,
        command,
      },
      timeout: timeout,
      uuid: tools.uuid(),
      id: Date.now(),
      attempts: 0,
      delay: delay,
      maxExceptions: null,
    };
    if (this.isQueueNotify === false) {
      delete data.delay;
      delete data.maxExceptions;
      data = {
        ...data,
        displayName: name,
        maxTries: null,
        timeoutAt: null,
      };
    }

    this.client.rpush(this.appname + this.prefix + 'queues:' + this.queue, JSON.stringify(data), (err, replay) => {
      // Queue pushed
    });
  }
}

class Job {
  constructor(obj) {
    this.job = null;
    this.connection = null;
    this.queue = null;
    this.chainConnection = null;
    this.chainQueue = null;
    this.delay = null;
    this.middleware = [];
    this.chained = [];

    if (obj) {
      Object.assign(this, obj); // <============ No ...
    }
  }
}

module.exports = {
  Queue,
  Job,
};
