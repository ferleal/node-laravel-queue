## Node Laravel Queue

Queue sync between NodeJS and Laravel using Redis driver. You can process Jobs dispatched from Laravel in NodeJS or biceversa.

This a modifed version from the original [Noderavel](https://github.com/movilizame/noderavel), special thanks to Mariano Botta

### Install

```bash
yarn add ferleal/node-laravel-queue
```

### Usage

* Listen for jobs on NodeJS:

```javascript
const nodelaravel = require('node-laravel-queue');
const redis = require('redis');

redisCliente = redis.createClient(6379, 'localhost'); 

 let  Job = nodelaravel.Job;
 let  Queue = nodelaravel.Queue;

let queueNodejsWorker = new Queue({
    client: redisCliente,
  // For Laravel 5.8 < you may need to tweek on the construct vars
  //  appname: '',
   //  prefix: '',
  //  isQueueNotify: false,
    queue: 'nodeJS',
    driver: 'redis',
    scope: {
        'App\\Jobs\\TestJob': Job,
       // Can use multiple scopes at once
      // 'App\\Jobs\\TestJob2': Job,

    }
});

queueNodejsWorker.on('job', ({name, data}) => {
    console.log(name, data);
    // Procces the pool here
});
queueNodejsWorker.listen();
```
* Sending jobs from Laravel :
```php
<?php
$job = new \App\Jobs\TestJob('please','send to','nodejs');
dispatch($job)->onQueue('nodeJS');
```

* Schedule a job to be run in Laravel from NodeJS:

```javascript
const nodelaravel = require('node-laravel-queue');
const redis = require('redis');

redisCliente = redis.createClient(6379, 'localhost'); 

 let  Job = nodelaravel.Job;
 let  Queue = nodelaravel.Queue;

let queueLaravelWorker = new Queue({
    client: redisCliente,
    appname: 'DotEnvAppName',
    driver: 'redis',
    scope: {
        'App\\Jobs\\TestJob': Job
    }
});
let job = new Job({a:'please', b:'send to',c:'laravel'});

queueLaravelWorker.redisPush('App\\Jobs\\TestJob', job);
```

__TestJob__ in Laravel: 

```php
<?php

namespace App\Jobs; 
use Illuminate\Contracts\Queue\ShouldQueue;

class TestJob extends Job implements ShouldQueue
{
    public $a, $b, $c;
    public function __construct ($a, $b, $c) {
        $this->a = $a;
        $this->b = $b;
    }

    function handle () {
        \Log::info('TestJob ' . $this->a . ' '. $this->b);
    }
}

```
