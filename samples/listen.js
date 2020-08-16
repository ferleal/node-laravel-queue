const nodelaravel = require('node-laravel-queue');

const redis = require('redis');

redisCliente = redis.createClient(6379, 'localhost');

let  Job = nodelaravel.Job;
let  Queue = nodelaravel.Queue;

let queueNodejsWorker = new Queue({
    client: redisCliente,
    queue: 'nodeJS',
    appname: '3dvent',
    driver: 'redis',
    scope: {
        'App\\Jobs\\TestJob': Job
    }
});

queueNodejsWorker.on('job', ({name, data}) => {
    console.log(name, data);
    // Proccess your jobs here.
});
queueNodejsWorker.listen();
