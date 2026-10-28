import {createServer} from 'node:http';
import {resolve} from 'node:path';
import handler from 'serve-handler';

const argument=process.argv.indexOf('--port');
const port=argument>=0?Number(process.argv[argument+1]):8094;
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Supply a valid --port between 1 and 65535.');
const server=createServer((req,res)=>handler(req,res,{public:resolve('public')}));
server.on('error',error=>{console.error('ONRO preview failed:',error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`ONRO preview: http://127.0.0.1:${port}/onro-studio/`));
