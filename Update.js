const whatsnew = `
  No data available
    
   

`;
const update = "28.8.26.v6";
if (typeof update !== "undefined") { //zorgt dat als update er niet is dat dan niet heel de website crashet
  document.getElementById("update").innerText = update;
}