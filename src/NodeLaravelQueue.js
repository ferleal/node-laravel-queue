const Serialize = require('php-serialize');
const EventEmitter = require('events');
const tools = require('./tools');
class Queue extends EventEmitter {
    constructor ({ driver = 'redis', client, scope = {}, queue = 'default' , appname = 'laravel',prefix = '_database_' }) {
        super();
        this.driver = driver;
        this.client = client;
        this.scope = scope;
        this.appname= appname;
        this.prefix = prefix;
        this.queue = queue;
    }

    listen () {
        switch (this.driver) {
            case 'redis':
                this.redisPop();
                break;
        }
    }


    push (name, object) {
        switch (this.driver) {
            case 'redis':
                this.redisPush(name, object);
                break;
        }
    }

    redisPop () {
        const pop = () => {

            this.client.blpop(this.appname+this.prefix+'queues:' + this.queue, 60000, (err, replay) => {
                if (err) {
                    // Error!
                } else {
                    let obj = JSON.parse(replay[1]);
                    let command = obj.data.command;
                    let raw = Serialize.unserialize(command, this.scope);
                    this.emit('job', {name: obj.data.commandName, data: raw});
                }
                this.client.blpop(this.appname+this.prefix+'queues:' + this.queue+":notify", 60000, (err, replay) => {});
                pop();
            });
        };
        pop();
    }

    redisPush (name, object,timeout=null,delay=null) {
        const command = Serialize.serialize(object, this.scope);
        let data = {
            job: 'Illuminate\\Queue\\CallQueuedHandler@call',
            data: {
                commandName: name,
                command
            },
            timeout: timeout,
            delay:delay,
            maxExceptions:null,
            uuid: tools.uuid(),
            id: Date.now(),
            attempts: 0
        };

        this.client.rpush(this.appname+this.prefix+'queues:' + this.queue, JSON.stringify(data), (err, replay) => {
            // Queue pushed
        });

    }

}
class Job {
    constructor (obj) {
        this.job= null;
        this.connection = null;
        this.queue = null;
        this.chainConnection= null;
        this.chainQueue= null;
        this.delay= null;
        this.middleware= [];
        this.chained = [];

        if (obj) {
            Object.assign(this, obj)     // <============ No ...
        }
    }
}

module.exports = {
    Queue,
    Job
} ;
