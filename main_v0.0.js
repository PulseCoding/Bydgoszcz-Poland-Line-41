// ----------------------------------------------------//
// Se crean las instancias de las librerias a utilizar //
// ----------------------------------------------------//
try{
  var modbus = require('jsmodbus');
  var fs = require('fs');
  var PubNub = require('pubnub');
//Asignar host, puerto y otros par ametros al cliente Modbus
var client = modbus.client.tcp.complete({
    'host': "192.168.20.26",
    'port': 502,
    'autoReconnect': true,
    'timeout': 60000,
    'logEnabled'    : true,
    'reconnectTimeout': 30000
}).connect();

var intId,timeStop=40,flagONS1=0,flagONS2=0,flagONS3=0,flagONS4=0,flagONS5=0,flagONS6=0,flagONS7=0,flagONS8=0,flagONS9=0,flagONS10=0,flagONS11=0;
var Filler,ctFiller=0,speedTempFiller=0,secFiller=0,stopCountFiller=0,flagStopFiller=0,flagPrintFiller=0,speedFiller=0,timeFiller=0;
var actualFiller=0,stateFiller=0;
var Capper,ctCapper=0,speedTempCapper=0,secCapper=0,stopCountCapper=0,flagStopCapper=0,flagPrintCapper=0,speedCapper=0,timeCapper=0;
var actualCapper=0,stateCapper=0;
var Depuck,ctDepuck=0,speedTempDepuck=0,secDepuck=0,stopCountDepuck=0,flagStopDepuck=0,flagPrintDepuck=0,speedDepuck=0,timeDepuck=0;
var actualDepuck=0,stateDepuck=0;
var Labeller,ctLabeller=0,speedTempLabeller=0,secLabeller=0,stopCountLabeller=0,flagStopLabeller=0,flagPrintLabeller=0,speedLabeller=0,timeLabeller=0;
var actualLabeller=0,stateLabeller=0;
var Shrinkwrapper,ctShrinkwrapper=0,speedTempShrinkwrapper=0,secShrinkwrapper=0,stopCountShrinkwrapper=0,flagStopShrinkwrapper=0,flagPrintShrinkwrapper=0,speedShrinkwrapper=0,timeShrinkwrapper=0;
var actualShrinkwrapper=0,stateShrinkwrapper=0;
var Tapper,ctTapper=0,speedTempTapper=0,secTapper=0,stopCountTapper=0,flagStopTapper=0,flagPrintTapper=0,speedTapper=0,timeTapper=0;
var actualTapper=0,stateTapper=0;
var Checkweigher,ctCheckweigher=0,speedTempCheckweigher=0,secCheckweigher=0,stopCountCheckweigher=0,flagStopCheckweigher=0,flagPrintCheckweigher=0,speedCheckweigher=0,timeCheckweigher=0;
var actualCheckweigher=0,stateCheckweigher=0;
var Paletizer,ctPaletizer=0,speedTempPaletizer=0,secPaletizer=0,stopCountPaletizer=0,flagStopPaletizer=0,flagPrintPaletizer=0,speedPaletizer=0,timePaletizer=0;
var actualPaletizer=0,statePaletizer=0;
var Barcode,secBarcode=0;
var secEOL=0,secPubNub=0;
var publishConfig;
var files = fs.readdirSync("/home/oee/Pulse/BYD_L41_LOGS/"); //Leer documentos
var actualdate = Date.now(); //Fecha actual
var text2send=[];//Vector a enviar
var flagInfo2Send=0;
var i=0;

function idle(){
  i=0;
  text2send=[];
  for ( k=0;k<files.length;k++){//Verificar los archivos
    var stats = fs.statSync("/home/oee/Pulse/BYD_L41_LOGS/"+files[k]);
    var mtime = new Date(stats.mtime).getTime();
    if (mtime< (Date.now() - (8*60*1000))&&files[k].indexOf("serialbox")==-1){
      flagInfo2Send=1;
      text2send[i]=files[k];
      i++;
    }
  }
}
pubnub = new PubNub({
  publishKey : "pub-c-ac9f95b7-c3eb-4914-9222-16fbcaad4c59",
  subscribeKey : "sub-c-206bed96-8c16-11e7-9760-3a607be72b06"
});

function senderData(){
  pubnub.publish(publishConfig, function(status, response) {
});}
// --------------------------------------------------------- //
//Función que realiza las instrucciones de lectura de datos  //
// --------------------------------------------------------- //
var DoRead = function (){
  if(secPubNub>=60*5){
    idle();
    secPubNub=0;
    publishConfig = {
      channel : "BYD_Monitor",
      message : {
            line: "41",
            tt: Date.now(),
            machines: text2send
          }
    };
    senderData();
  }else{
    secPubNub++;
  }
    client.readHoldingRegisters(0,60).then(function(resp){
        var statesFiller              = switchData(resp.register[0],resp.register[1]),
            statesCapper              = switchData(resp.register[2],resp.register[3]),
            statesDepuck              = switchData(resp.register[4],resp.register[5]),
            statesLabeller            = switchData(resp.register[6],resp.register[7]),
            statesShrinkwrapper       = switchData(resp.register[8],resp.register[9]),
            statesTapper               = switchData(resp.register[10],resp.register[11]),
            statesCheckweigher        = switchData(resp.register[12],resp.register[13]),
            statesPaletizer           = switchData(resp.register[14],resp.register[15]);
            //Filler -------------------------------------------------------------------------------------------------------------
              ctFiller = joinWord(resp.register[23],resp.register[22]);
                if(flagONS1===0){
                   speedTempFiller=ctFiller;
                   flagONS1=1;
              }
              if (secFiller>=60){
                  if(stopCountFiller===0||flagStopFiller==1){
                     flagPrintFiller=1;
                      secFiller=0;
                      speedFiller=ctFiller-speedTempFiller;
                      speedTempFiller=ctFiller;
                  }
                  if(flagStopFiller==1){
                      timeFiller=Date.now();
                  }
              }
              secFiller++;
              if(ctFiller>actualFiller){
                  stateFiller=1;//RUN
                  if(stopCountFiller>=timeStop){
                      speedFiller=0;
                      secFiller=0;
                  }
                  timeFiller=Date.now();
                  stopCountFiller=0;
                  flagStopFiller=0;


              }else if(ctFiller==actualFiller){
                  if(stopCountFiller===0){
                      timeFiller=Date.now();
                  }
                  stopCountFiller++;
                  if(stopCountFiller>=timeStop){
                      stateFiller=2;//STOP
                      speedFiller=0;
                      if(flagStopFiller===0){
                          flagPrintFiller=1;
                          secFiller=0;
                      }
                      flagStopFiller=1;
                  }
              }
              if(stateFiller==2){
                  speedTempFiller=ctFiller;
              }

              actualFiller=ctFiller;
              if(stateFiller==2){
                  if(statesFiller[5]==1){
                      stateFiller=3;//Wait
                  }else{
                      if(statesFiller[4]==1){
                          stateFiller=4;//Block
                      }
                  }
              }
              Filler = {
                  ST: stateFiller,
                  CPQI: joinWord(resp.register[21],resp.register[20]),
                  CPQO: joinWord(resp.register[23],resp.register[22]),
                  //CPQR: joinWord(resp.register[41],resp.register[40]),
                  SP: speedFiller
              };
              if(flagPrintFiller==1){
                  for(var key in Filler){
                      fs.appendFileSync("/home/oee/Pulse/BYD_L41_LOGS/pol_byd_Filler_L41.log","tt="+timeFiller+",var="+key+",val="+Filler[key]+"\n");
                  }
                  flagPrintFiller=0;
              }
            //Filler -------------------------------------------------------------------------------------------------------------
            //Capper -------------------------------------------------------------------------------------------------------------
              ctCapper = joinWord(resp.register[25],resp.register[24]);
                if(flagONS2===0){
                   speedTempCapper=ctCapper;
                   flagONS2=1;
              }
              if (secCapper>=60){
                  if(stopCountCapper===0||flagStopCapper==1){
                     flagPrintCapper=1;
                      secCapper=0;
                      speedCapper=ctCapper-speedTempCapper;
                      speedTempCapper=ctCapper;
                  }
                  if(flagStopCapper==1){
                      timeCapper=Date.now();
                  }
              }
              secCapper++;
              if(ctCapper>actualCapper){
                  stateCapper=1;//RUN
                  if(stopCountCapper>=timeStop){
                      speedCapper=0;
                      secCapper=0;
                  }
                  timeCapper=Date.now();
                  stopCountCapper=0;
                  flagStopCapper=0;


              }else if(ctCapper==actualCapper){
                  if(stopCountCapper===0){
                      timeCapper=Date.now();
                  }
                  stopCountCapper++;
                  if(stopCountCapper>=timeStop){
                      stateCapper=2;//STOP
                      speedCapper=0;
                      if(flagStopCapper===0){
                          flagPrintCapper=1;
                          secCapper=0;
                      }
                      flagStopCapper=1;
                  }
              }
              if(stateCapper==2){
                  speedTempCapper=ctCapper;
              }

              actualCapper=ctCapper;
              if(stateCapper==2){
                  if(statesCapper[5]==1){
                      stateCapper=3;//Wait
                  }else{
                      if(statesCapper[4]==1){
                          stateCapper=4;//Block
                      }
                  }
              }
              Capper = {
                  ST: stateCapper,
                  //CPQI: joinWord(resp.register[21],resp.register[20]),
                  CPQO: joinWord(resp.register[25],resp.register[24]),
                  //CPQR: joinWord(resp.register[41],resp.register[40]),
                  SP: speedCapper
              };
              if(flagPrintCapper==1){
                  for(var key in Capper){
                      fs.appendFileSync("/home/oee/Pulse/BYD_L41_LOGS/pol_byd_Capper_L41.log","tt="+timeCapper+",var="+key+",val="+Capper[key]+"\n");
                  }
                  flagPrintCapper=0;
              }
            //Capper -------------------------------------------------------------------------------------------------------------
            //Depuck -------------------------------------------------------------------------------------------------------------
              ctDepuck = joinWord(resp.register[27],resp.register[26]);
                if(flagONS3===0){
                   speedTempDepuck=ctDepuck;
                   flagONS3=1;
              }
              if (secDepuck>=60){
                  if(stopCountDepuck===0||flagStopDepuck==1){
                     flagPrintDepuck=1;
                      secDepuck=0;
                      speedDepuck=ctDepuck-speedTempDepuck;
                      speedTempDepuck=ctDepuck;
                  }
                  if(flagStopDepuck==1){
                      timeDepuck=Date.now();
                  }
              }
              secDepuck++;
              if(ctDepuck>actualDepuck){
                  stateDepuck=1;//RUN
                  if(stopCountDepuck>=timeStop){
                      speedDepuck=0;
                      secDepuck=0;
                  }
                  timeDepuck=Date.now();
                  stopCountDepuck=0;
                  flagStopDepuck=0;


              }else if(ctDepuck==actualDepuck){
                  if(stopCountDepuck===0){
                      timeDepuck=Date.now();
                  }
                  stopCountDepuck++;
                  if(stopCountDepuck>=timeStop){
                      stateDepuck=2;//STOP
                      speedDepuck=0;
                      if(flagStopDepuck===0){
                          flagPrintDepuck=1;
                          secDepuck=0;
                      }
                      flagStopDepuck=1;
                  }
              }
              if(stateDepuck==2){
                  speedTempDepuck=ctDepuck;
              }

              actualDepuck=ctDepuck;
              if(stateDepuck==2){
                  if(statesDepuck[5]==1){
                      stateDepuck=3;//Wait
                  }else{
                      if(statesDepuck[4]==1){
                          stateDepuck=4;//Block
                      }
                  }
              }
              Depuck = {
                  ST: stateDepuck,
                  //CPQI: joinWord(resp.register[21],resp.register[20]),
                  CPQO: joinWord(resp.register[27],resp.register[26]),
                  //CPQR: joinWord(resp.register[41],resp.register[40]),
                  SP: speedDepuck
              };
              if(flagPrintDepuck==1){
                  for(var key in Depuck){
                      fs.appendFileSync("/home/oee/Pulse/BYD_L41_LOGS/pol_byd_Depuck_L41.log","tt="+timeDepuck+",var="+key+",val="+Depuck[key]+"\n");
                  }
                  flagPrintDepuck=0;
              }
            //Depuck -------------------------------------------------------------------------------------------------------------
            //Labeller -------------------------------------------------------------------------------------------------------------
              ctLabeller = joinWord(resp.register[31],resp.register[30]);
                if(flagONS4===0){
                   speedTempLabeller=ctLabeller;
                   flagONS4=1;
              }
              if (secLabeller>=60){
                  if(stopCountLabeller===0||flagStopLabeller==1){
                     flagPrintLabeller=1;
                      secLabeller=0;
                      speedLabeller=ctLabeller-speedTempLabeller;
                      speedTempLabeller=ctLabeller;
                  }
                  if(flagStopLabeller==1){
                      timeLabeller=Date.now();
                  }
              }
              secLabeller++;
              if(ctLabeller>actualLabeller){
                  stateLabeller=1;//RUN
                  if(stopCountLabeller>=timeStop){
                      speedLabeller=0;
                      secLabeller=0;
                  }
                  timeLabeller=Date.now();
                  stopCountLabeller=0;
                  flagStopLabeller=0;


              }else if(ctLabeller==actualLabeller){
                  if(stopCountLabeller===0){
                      timeLabeller=Date.now();
                  }
                  stopCountLabeller++;
                  if(stopCountLabeller>=timeStop){
                      stateLabeller=2;//STOP
                      speedLabeller=0;
                      if(flagStopLabeller===0){
                          flagPrintLabeller=1;
                          secLabeller=0;
                      }
                      flagStopLabeller=1;
                  }
              }
              if(stateLabeller==2){
                  speedTempLabeller=ctLabeller;
              }

              actualLabeller=ctLabeller;
              if(stateLabeller==2){
                  if(statesLabeller[5]==1){
                      stateLabeller=3;//Wait
                  }else{
                      if(statesLabeller[4]==1){
                          stateLabeller=4;//Block
                      }
                  }
              }
              Labeller = {
                  ST: stateLabeller,
                  CPQI: joinWord(resp.register[29],resp.register[28]),
                  CPQO: joinWord(resp.register[31],resp.register[30]),
                  CPQR: joinWord(resp.register[33],resp.register[32]),
                  SP: speedLabeller
              };
              if(flagPrintLabeller==1){
                  for(var key in Labeller){
                      fs.appendFileSync("/home/oee/Pulse/BYD_L41_LOGS/pol_byd_Labeller_L41.log","tt="+timeLabeller+",var="+key+",val="+Labeller[key]+"\n");
                  }
                  flagPrintLabeller=0;
              }
            //Labeller -------------------------------------------------------------------------------------------------------------
            //Shrinkwrapper -------------------------------------------------------------------------------------------------------------
              ctShrinkwrapper = joinWord(resp.register[37],resp.register[36]);
                if(flagONS5===0){
                   speedTempShrinkwrapper=ctShrinkwrapper;
                   flagONS5=1;
              }
              if (secShrinkwrapper>=60){
                  if(stopCountShrinkwrapper===0||flagStopShrinkwrapper==1){
                     flagPrintShrinkwrapper=1;
                      secShrinkwrapper=0;
                      speedShrinkwrapper=ctShrinkwrapper-speedTempShrinkwrapper;
                      speedTempShrinkwrapper=ctShrinkwrapper;
                  }
                  if(flagStopShrinkwrapper==1){
                      timeShrinkwrapper=Date.now();
                  }
              }
              secShrinkwrapper++;
              if(ctShrinkwrapper>actualShrinkwrapper){
                  stateShrinkwrapper=1;//RUN
                  if(stopCountShrinkwrapper>=timeStop){
                      speedShrinkwrapper=0;
                      secShrinkwrapper=0;
                  }
                  timeShrinkwrapper=Date.now();
                  stopCountShrinkwrapper=0;
                  flagStopShrinkwrapper=0;


              }else if(ctShrinkwrapper==actualShrinkwrapper){
                  if(stopCountShrinkwrapper===0){
                      timeShrinkwrapper=Date.now();
                  }
                  stopCountShrinkwrapper++;
                  if(stopCountShrinkwrapper>=timeStop){
                      stateShrinkwrapper=2;//STOP
                      speedShrinkwrapper=0;
                      if(flagStopShrinkwrapper===0){
                          flagPrintShrinkwrapper=1;
                          secShrinkwrapper=0;
                      }
                      flagStopShrinkwrapper=1;
                  }
              }
              if(stateShrinkwrapper==2){
                  speedTempShrinkwrapper=ctShrinkwrapper;
              }

              actualShrinkwrapper=ctShrinkwrapper;
              if(stateShrinkwrapper==2){
                  if(statesShrinkwrapper[5]==1){
                      stateShrinkwrapper=3;//Wait
                  }else{
                      if(statesShrinkwrapper[4]==1){
                          stateShrinkwrapper=4;//Block
                      }
                  }
              }
              Shrinkwrapper = {
                  ST: stateShrinkwrapper,
                  CPQI: joinWord(resp.register[35],resp.register[34]),
                  CPQO: joinWord(resp.register[37],resp.register[36]),
                  //CPQR: joinWord(resp.register[33],resp.register[32]),
                  SP: speedShrinkwrapper
              };
              if(flagPrintShrinkwrapper==1){
                  for(var key in Shrinkwrapper){
                      fs.appendFileSync("/home/oee/Pulse/BYD_L41_LOGS/pol_byd_Shrinkwrapper_L41.log","tt="+timeShrinkwrapper+",var="+key+",val="+Shrinkwrapper[key]+"\n");
                  }
                  flagPrintShrinkwrapper=0;
              }
            //Shrinkwrapper -------------------------------------------------------------------------------------------------------------
            //Tapper -------------------------------------------------------------------------------------------------------------
              ctTapper = joinWord(resp.register[39],resp.register[38]);
                if(flagONS6===0){
                   speedTempTapper=ctTapper;
                   flagONS6=1;
              }
              if (secTapper>=60){
                  if(stopCountTapper===0||flagStopTapper==1){
                     flagPrintTapper=1;
                      secTapper=0;
                      speedTapper=ctTapper-speedTempTapper;
                      speedTempTapper=ctTapper;
                  }
                  if(flagStopTapper==1){
                      timeTapper=Date.now();
                  }
              }
              secTapper++;
              if(ctTapper>actualTapper){
                  stateTapper=1;//RUN
                  if(stopCountTapper>=80){
                      speedTapper=0;
                      secTapper=0;
                  }
                  timeTapper=Date.now();
                  stopCountTapper=0;
                  flagStopTapper=0;


              }else if(ctTapper==actualTapper){
                  if(stopCountTapper===0){
                      timeTapper=Date.now();
                  }
                  stopCountTapper++;
                  if(stopCountTapper>=80){
                      stateTapper=2;//STOP
                      speedTapper=0;
                      if(flagStopTapper===0){
                          flagPrintTapper=1;
                          secTapper=0;
                      }
                      flagStopTapper=1;
                  }
              }
              if(stateTapper==2){
                  speedTempTapper=ctTapper;
              }

              actualTapper=ctTapper;
              if(stateTapper==2){
                  if(statesTapper[5]==1){
                      stateTapper=3;//Wait
                  }else{
                      if(statesTapper[4]==1){
                          stateTapper=4;//Block
                      }
                  }
              }
              Tapper = {
                  ST: stateTapper,
                  //CPQI: joinWord(resp.register[35],resp.register[34]),
                  CPQO: joinWord(resp.register[39],resp.register[38]),
                  //CPQR: joinWord(resp.register[33],resp.register[32]),
                  SP: speedTapper
              };
              if(flagPrintTapper==1){
                  for(var key in Tapper){
                      fs.appendFileSync("/home/oee/Pulse/BYD_L41_LOGS/pol_byd_Tapper_L41.log","tt="+timeTapper+",var="+key+",val="+Tapper[key]+"\n");
                  }
                  flagPrintTapper=0;
              }
            //Tapper -------------------------------------------------------------------------------------------------------------
            //Checkweigher -------------------------------------------------------------------------------------------------------------
              ctCheckweigher = joinWord(resp.register[43],resp.register[42]);
                if(flagONS7===0){
                   speedTempCheckweigher=ctCheckweigher;
                   flagONS7=1;
              }
              if (secCheckweigher>=60){
                  if(stopCountCheckweigher===0||flagStopCheckweigher==1){
                     flagPrintCheckweigher=1;
                      secCheckweigher=0;
                      speedCheckweigher=ctCheckweigher-speedTempCheckweigher;
                      speedTempCheckweigher=ctCheckweigher;
                  }
                  if(flagStopCheckweigher==1){
                      timeCheckweigher=Date.now();
                  }
              }
              secCheckweigher++;
              if(ctCheckweigher>actualCheckweigher){
                  stateCheckweigher=1;//RUN
                  if(stopCountCheckweigher>=timeStop){
                      speedCheckweigher=0;
                      secCheckweigher=0;
                  }
                  timeCheckweigher=Date.now();
                  stopCountCheckweigher=0;
                  flagStopCheckweigher=0;


              }else if(ctCheckweigher==actualCheckweigher){
                  if(stopCountCheckweigher===0){
                      timeCheckweigher=Date.now();
                  }
                  stopCountCheckweigher++;
                  if(stopCountCheckweigher>=timeStop){
                      stateCheckweigher=2;//STOP
                      speedCheckweigher=0;
                      if(flagStopCheckweigher===0){
                          flagPrintCheckweigher=1;
                          secCheckweigher=0;
                      }
                      flagStopCheckweigher=1;
                  }
              }
              if(stateCheckweigher==2){
                  speedTempCheckweigher=ctCheckweigher;
              }

              actualCheckweigher=ctCheckweigher;
              if(stateCheckweigher==2){
                  if(statesCheckweigher[5]==1){
                      stateCheckweigher=3;//Wait
                  }else{
                      if(statesCheckweigher[4]==1){
                          stateCheckweigher=4;//Block
                      }
                  }
              }
              Checkweigher = {
                  ST: stateCheckweigher,
                  CPQI: joinWord(resp.register[41],resp.register[40]),
                  CPQO: joinWord(resp.register[43],resp.register[42]),
                  CPQR: joinWord(resp.register[45],resp.register[44]),
                  SP: speedCheckweigher
              };
              if(flagPrintCheckweigher==1){
                  for(var key in Checkweigher){
                      fs.appendFileSync("/home/oee/Pulse/BYD_L41_LOGS/pol_byd_Checkweigher_L41.log","tt="+timeCheckweigher+",var="+key+",val="+Checkweigher[key]+"\n");
                  }
                  flagPrintCheckweigher=0;
              }
            //Checkweigher -------------------------------------------------------------------------------------------------------------
            //Paletizer -------------------------------------------------------------------------------------------------------------
              ctPaletizer = joinWord(resp.register[47],resp.register[46]);
                if(flagONS8===0){
                   speedTempPaletizer=ctPaletizer;
                   flagONS8=1;
              }
              if (secPaletizer>=60){
                  if(stopCountPaletizer===0||flagStopPaletizer==1){
                     flagPrintPaletizer=1;
                      secPaletizer=0;
                      speedPaletizer=ctPaletizer-speedTempPaletizer;
                      speedTempPaletizer=ctPaletizer;
                  }
                  if(flagStopPaletizer==1){
                      timePaletizer=Date.now();
                  }
              }
              secPaletizer++;
              if(ctPaletizer>actualPaletizer){
                  statePaletizer=1;//RUN
                  if(stopCountPaletizer>=timeStop){
                      speedPaletizer=0;
                      secPaletizer=0;
                  }
                  timePaletizer=Date.now();
                  stopCountPaletizer=0;
                  flagStopPaletizer=0;


              }else if(ctPaletizer==actualPaletizer){
                  if(stopCountPaletizer===0){
                      timePaletizer=Date.now();
                  }
                  stopCountPaletizer++;
                  if(stopCountPaletizer>=timeStop){
                      statePaletizer=2;//STOP
                      speedPaletizer=0;
                      if(flagStopPaletizer===0){
                          flagPrintPaletizer=1;
                          secPaletizer=0;
                      }
                      flagStopPaletizer=1;
                  }
              }
              if(statePaletizer==2){
                  speedTempPaletizer=ctPaletizer;
              }

              actualPaletizer=ctPaletizer;
              if(statePaletizer==2){
                  if(statesPaletizer[5]==1){
                      statePaletizer=3;//Wait
                  }else{
                      if(statesPaletizer[4]==1){
                          statePaletizer=4;//Block
                      }
                  }
              }
              Paletizer = {
                  ST: statePaletizer,
                  CPQI: joinWord(resp.register[47],resp.register[46]),
                  //CPQO: joinWord(resp.register[43],resp.register[42]),
                  //CPQR: joinWord(resp.register[45],resp.register[44]),
                  SP: speedPaletizer
              };
              if(flagPrintPaletizer==1){
                  for(var key in Paletizer){
                      fs.appendFileSync("/home/oee/Pulse/BYD_L41_LOGS/pol_byd_Paletizer_L41.log","tt="+timePaletizer+",var="+key+",val="+Paletizer[key]+"\n");
                  }
                  flagPrintPaletizer=0;
              }
            //Paletizer -------------------------------------------------------------------------------------------------------------
          //Barcode -------------------------------------------------------------------------------------------------------------
          if(resp.register[50]==0&&resp.register[51]==0&&resp.register[52]==0&&resp.register[53]==0&&resp.register[54]==0&&resp.register[55]==0&&resp.register[56]==0&&resp.register[57]){
            Barcode='0';
          }else {
            var dig1=hex2a(assignment(resp.register[50]).toString(16));
            var dig2=hex2a(assignment(resp.register[51]).toString(16));
            var dig3=hex2a(assignment(resp.register[52]).toString(16));
            var dig4=hex2a(assignment(resp.register[53]).toString(16));
            var dig5=hex2a(assignment(resp.register[54]).toString(16));
            var dig6=hex2a(assignment(resp.register[55]).toString(16));
            var dig7=hex2a(assignment(resp.register[56]).toString(16));
            var dig8=hex2a(assignment(resp.register[57]).toString(16));
            Barcode=dig1+dig2+dig3+dig4+dig5+dig6+dig7+dig8;
          }
          console.log(Barcode)
          if(isNaN(Barcode)){
            Barcode='0';
          }
	        if(secBarcode>=60&&!isNaN(Barcode)){
              writedataBarcode(Barcode,"pol_byd_Barcode_L41.log");
              secBarcode=0;
          }
          secBarcode++;
          //Barcode -------------------------------------------------------------------------------------------------------------
          //EOL --------------------------------------------------------------------------------------------------------------------
          if(secEOL>=60){
            fs.appendFileSync("../BYD_L41_LOGS/pol_byd_EOL_L41.log","tt="+Date.now()+",var=EOL"+",val="+Paletizer.CPQI+"\n");
            secEOL=0;
          }
          secEOL++;
          //EOL --------------------------------------------------------------------------------------------------------------------
    });//END Client Read
};

var assignment = function (val){
  var result;
  if(val<4095)
    result = "";
  else
    result = val;
    return result;
};

function hex2a(hex){
   var str = '';
   for (var i = 0; i < hex.length; i += 2)
   str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

var stateMachine = function (data){
	if(data[7]==1){
		return 1;//RUN
	}
	if(data[6]==1){
		return 2;//STOP
	}
	if(data[5]==1){
		return 3;//WAIT
	}
	if(data[4]==1){
		return 4;//BLOCK
	}
	return 2;
};

var counterState = function (actual,temp){
	if(actual!=temp){
		return 1;
	}else {
		return 2;
	}
};

var writedata = function (varJson,nameFile){
    var data;
    var timet=Date.now();
    for(var key in varJson){
        fs.appendFileSync("/home/pi/Pulse/BYD_L41_LOGS/"+nameFile,"tt="+timet+",var="+key+",val="+varJson[key]+"\n");
    }
};

var writedataBarcode = function (barcode,nameFile){
    var timet=Date.now();
    fs.appendFileSync("../BYD_L41_LOGS/"+nameFile,"tt="+timet+",var=bc"+",val="+barcode+"\n");
};

var joinWord = function (num1,num2){
    var bits="00000000000000000000000000000000";
    var  bin1=num1.toString(2),
         bin2=num2.toString(2),
         newNum = bits.split("");

        for(var i=0;i<bin1.length;i++){
            newNum[31-i]=bin1[(bin1.length-1)-i];
        }
        for(var j=0;j<bin2.length;j++){
            newNum[15-j]=bin2[(bin2.length-1)-j];
        }
        bits=newNum.join("");
        return parseInt(bits,2);
};
var switchData = function (num1,num2){
    var bits="00000000000000000000000000000000";
    var  bin1=num1.toString(2),
        bin2=num2.toString(2),
        newNum = bits.split("");

        for(var i=0;i<bin1.length;i++){
            newNum[15-i]=bin1[(bin1.length-1)-i];
        }
        for(var j=0;j<bin2.length;j++){
            newNum[31-j]=bin2[(bin2.length-1)-j];
        }
        bits=newNum.join("");

        return bits;
};

var stop = function () {
    ///This function clean data
    clearInterval(intId);
};

var shutdown = function () {
    ///Use function STOP and close connection
    stop();
    client.close();
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);


///*If client is connect call a function "DoRead"*/
client.on('connect', function(err) {
    setInterval(function(){
        DoRead();
    }, 1000);
});

///*If client is in a error ejecute an acction*/
client.on('error', function (err) {
    fs.appendFileSync("error.log","ID 1: "+Date.now()+": "+err+"\n");
    //console.log('Client Error', err);
});
///If client try closed, this metodo try reconnect client to server
client.on('close', function () {
    //console.log('Client closed, stopping interval.');
    fs.appendFileSync("error.log","ID 2: "+Date.now()+": "+'Client closed, stopping interval.'+"\n");
    stop();
});

}catch(err){
    fs.appendFileSync("error.log","ID 3: "+Date.now()+": "+err+"\n");
}
