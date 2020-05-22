//

const https = require('https')
var fs = require('fs');

var fileName = "libdatajsnames.txt";
var libRep = "npm"; // pypi and others


var alldata = "";
var api_key = require("../license.json").license;
var options = {
  hostname: 'libraries.io',
  port: 443,
  path: '/api/:repository:/:lib:?api_key='+api_key,
  method: 'GET'
}

var options2 = {
  hostname: 'libraries.io',
  port: 443,
  path: '/api/:repository:/:lib:/:version:/dependencies?api_key='+api_key,
  method: 'GET'
}


var repository = ''+ process.argv[2];
var lib = '' + process.argv[3];
var version = '' + process.argv[4];
fileName = '' + process.argv[5];

if( lib != 'undefined' && lib != '' && version != 'undefined' && version != ''){
  options.path = options.path.replace(':lib:',lib);
  options.path = options.path.replace(':repository:',repository);

  options2.path = options2.path.replace(':lib:',lib);
  options2.path = options2.path.replace(':version:',version);
  options2.path = options2.path.replace(':repository:',repository);
  //options.path = options.replace(':lib:','amqp');

  //console.log(options.path);
  //process.exit();


  const req1 = https.request(options, (res) => {
    //console.log(`statusCode: ${res.statusCode}`)
    var data = "";
    res.on('data', (d) => {
      data += d;
      //process.stdout.write(d)
    })

    res.on('end', ()=>{
        var libData = JSON.parse(data);
        alldata += ("\""+libData.name + "\",\"" +
                  libData.description + "\"," +
                  libData.latest_stable_release_number + "," +
                  libData.latest_stable_release_published_at + " , " +
                  libData.versions[0].published_at+ "," +
                  libData.versions.length + "," +
                  libData.latest_stable_release.runtime_dependencies_count
                );
        //console.log(alldata);
        req2.end();
    });
  })


  req1.on('error', (error) => {
    console.error(error)
  });


  const req2 = https.request(options2, (res) => {
    //console.log(`statusCode: ${res.statusCode}`)
    var data = "";
    res.on('data', (d) => {
      data += d;

      //process.stdout.write(d)
    })

    res.on('end', ()=>{
        var libData = JSON.parse(data);

        var str = ",";

        for( var i=0 ; i < libData.dependencies.length ; i++){
          str += libData.dependencies[i].name+"/"+ libData.dependencies[i].latest_stable+"/"+libData.dependencies[i].outdated+"/"+libData.dependencies[i].deprecated+ "&"
        }
        alldata += str + "\n";

        console.log(alldata);
        if( fileName != '' && fileName != 'undefined'){
          fs.appendFileSync(fileName,alldata,'utf8');
        }
    });
  })


  req2.on('error', (error) => {
    console.error(error)
  });


  req1.end();
}else{

  console.log("Usage node index.js <librepository:npm(default)|pypi> <package> <version> <filenametosave(optional)");

}
