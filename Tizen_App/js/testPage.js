
console.log("starting");
var lnk = localStorage.getItem("link");
console.log(lnk);




document.addEventListener('keydown', function(remoteEvent) {
	
	document.getElementById('kata').innerHTML=lnk;
});