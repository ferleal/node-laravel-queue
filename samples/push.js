const nodelaravel = require('node-laravel-queue');

const redis = require('redis');

redisCliente = redis.createClient(6379, 'localhost');

let  Job = nodelaravel.Job;
let  Queue = nodelaravel.Queue;

let queueLaravelWorker = new Queue({
    client: redisCliente,
    driver: 'redis',
    scope: {
        'App\\Jobs\\TestJob': Job
    }
});

let job = new Job({a:'please', b:'send to',c:'laravel'});
queueLaravelWorker.redisPush('App\\Jobs\\TestJob', job);
