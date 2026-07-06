const whatsnew = `
  What is new in the new version,
    -new update system
    -spreadsheet import system
    -terminal for advanced users
    -bug fixes
    
    
   

`;
const update = "6.7.26";
if (typeof update !== "undefined") { //zorgt dat als update er niet is dat dan niet heel de website crashet
  document.getElementById("update").innerText = update;
}