import util from "util";
import {connectDatabase} from "./db.js";

async function testDatabase(){
    const db = await connectDatabase();
    db.query = util.promisify(db.query); 
      // Menghubungkan ke database
      try{
          const products = await db.query("SELECT * FROM user LIMIT 10");
          console.log('Isi Table: ',JSON.stringify(products,null,2)); 
      }catch(err){
        console.error("Error fetching data:",err);
      }finally{
        db.end();
      }

    
}
testDatabase();