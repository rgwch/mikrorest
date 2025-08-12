// call with: http://localhost:3339/temperature?date=2025/08/12

import {MikroRest} from '.'
import path from 'path'
const server=new MikroRest()

server.addStaticDir(path.join(__dirname, "..", "tests"));
server.addRoute("get", "/temperature", async (req, res) => {
  const params=server.getParams(req)
  if(params.get("date")=="2025/08/12"){
    server.sendJson(res, {
      "temperature": "hot"
    })
  }else{
    server.sendJson(res, {
      "temperature": "don't know"
    })
  }
  return false
  });
server.start()
