var lottery={};var lotteries={};var activeRooms={};var minRate=1;var explorerLink="https://etherscan.io/address/";var account;var generatingInterval;function getStatusLottery(contractLottery){if(lottery.status=="generating"){$(".transferFunds").prev().fadeOut(0);$(".transferFunds").fadeOut(0);$(".p_bar").prev().fadeIn(0);$(".p_bar").fadeIn(0);w3.eth.getBlockNumber(function(error,result){contractLottery.randomBlockStart(activeRoom).then(function(blokStart){console.log(blokStart[0].toString(10));blokStart=blokStart[0].toString(10);if(blokStart!=0){lottery.progress=result-blokStart}renderProgress()})})}else{$(".transferFunds").prev().fadeIn(0);$(".transferFunds").fadeIn(0);$(".p_bar").prev().fadeOut(0);$(".p_bar").fadeOut(0);clearInterval(generatingInterval);generatingInterval=undefined}}function renderProgress(){if(lottery.progress>256){$(".p_bar ul li").html("");$(".p_bar ul li").removeClass("done")}if(lottery.progress<0){lottery.progress=0}if(lottery.progress>31){lottery.progress=32}var animateBlock='<div class="progress progress-bar-vertical"><div class="progress-bar progress-bar-success progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="height: 100%;"></div></div>';for(var i=0;i<lottery.progress;i++){$(".p_bar ul li").eq(i).addClass("done")}$(".p_bar ul li").html("");$(".p_bar ul li").eq(i).html(animateBlock);$(".p_bar .status span").text(lottery.progress);if(generatingInterval==undefined&&lottery.progress<=32){generatingInterval=setInterval(function(){$(".tickets-list li").removeClass("random-ticket");var rand=randomInteger(1,parseInt(lottery.maxTickets.toString(10)));$(".tickets-list li[data-num='"+rand+"']").addClass("random-ticket")},1e3)}}function randomInteger(min,max){var rand=min-.5+Math.random()*(max-min+1);rand=Math.round(rand);return rand}function weiToEth(wei,dest){return wei/1e18}function handle(contractLottery){contractLottery.getRomms().then(function(rooms){if(isNaN(activeRoom)||activeRoom==null||activeRoom>rooms["active"].length||activeRoom<0||rooms["active"][activeRoom]==false){for(var r in rooms["active"]){if(rooms["active"][r]==true){activeRoom=parseInt(r);break}}}for(var r in rooms["active"]){if(rooms["active"][r]==true){activeRooms[r]={comission:rooms["comission"][r],lastActivity:rooms["lastActivity"][r],price:rooms["price"][r],prize:rooms["prize"][r],tickets:rooms["tickets"][r],ticketsBought:rooms["ticketsBought"][r]}}}renderRooms(activeRooms);renderWinners(contractLottery);if(typeof web3!=="undefined"){web3.eth.getAccounts(function(err,accounts){account=accounts[0];if(account==undefined){showAlert(0,"Please log into metamask and reload this page")}else{addRefLink()}})}else{showAlert(0,"Metamask plugin is required to play the game")}addEvents(contractLottery);init(contractLottery)})}function init(contractLottery){contractLottery.getPlayers(activeRoom).then(function(players){initializeLottery(players);renderLotteryData(players);var tiketsStr="";contractLottery.getTickets(activeRoom).then(function(tickets){for(var i=0;i<tickets[0].length;i++){if(parseInt(tickets[0][i].toString(10))==1){tiketsStr+="<li data-num="+(i+1)+' class="purchased"><div>'+(i+1)+"</div></li>"}else{tiketsStr+="<li data-num="+(i+1)+"><div>"+(i+1)+"</div></li>"}}$(".tickets-list").append(tiketsStr);if(localStorage.getItem("ticketsBought")){var tBought=localStorage.getItem("ticketsBought");tBought=JSON.parse(tBought);if(tBought[activeRoom]!=undefined){var i=tBought[activeRoom].length;while(i--){if($(".tickets-list li[data-num='"+tBought[activeRoom][i]+"']").hasClass("purchased")){tBought[activeRoom].splice(i,1)}}localStorage.setItem("ticketsBought",JSON.stringify(tBought))}if(tBought["cashTime"]<Date.now()){if(tBought[activeRoom]!=undefined){tBought[activeRoom]=[];localStorage.setItem("ticketsBought",JSON.stringify(tBought))}}if(tBought[activeRoom]!=undefined){for(var t in tBought[activeRoom]){$(".tickets-list li[data-num='"+tBought[activeRoom][t]+"']").addClass("my-tickets")}}}$("body").on("click",".tickets-list li:not(.purchased, .my-tickets)",selectTicketEvent);if(lottery.avialableTickets==0){lottery.status="generating";lottery.progress=0}getStatusLottery(contractLottery);$(".loader").fadeOut(100);setInterval(function(){getStatusLottery(contractLottery)},5e3)})})}function selectTicketEvent(){var selectedState=$(this).hasClass("selected");if(selectedState){var ticketNumber=$(".tickets-list li.selected").length-1}else{var ticketNumber=$(".tickets-list li.selected").length+1}if(ticketNumber>lottery.maxRate&&!selectedState){showAlert(1e3,"you cannot buy more tickets in this lottery");return}if(selectedState){$(this).removeClass("selected")}else{$(this).addClass("selected")}$(".count-select-tick b").text(ticketNumber);$(".count-select-tick span").text(multFloats(ticketNumber,lottery.ticketPriceEth)+" ETH")}function initializeLottery(players){lottery.avialableTickets=activeRooms[activeRoom].tickets.sub(activeRooms[activeRoom].ticketsBought);lottery.soldTickets=activeRooms[activeRoom].ticketsBought;lottery.ticketPrice=activeRooms[activeRoom].price;lottery.maxEth=weiToEth(activeRooms[activeRoom].price.mul(activeRooms[activeRoom].tickets),"ether");lottery.soldEth=weiToEth(activeRooms[activeRoom].price.mul(lottery.soldTickets),"ether");lottery.ticketPriceEth=weiToEth(activeRooms[activeRoom].price,"ether");lottery.currentSold=0;lottery.minRate=1;for(var i=0;i<players.resultLength.toString(10);i++){if(players[1][i]==account){lottery.currentSold=players[2][i]}}lottery.maxPlayerWin=.49;lottery.maxTickets=activeRooms[activeRoom].tickets;lottery.maxRate=lottery.maxTickets*lottery.maxPlayerWin-lottery.currentSold;if(lottery.avialableTickets<lottery.maxRate){lottery.maxRate=lottery.avialableTickets}if(lottery.maxRate==0||lottery.avialableTickets==0){showAlert(3e4,"All tickets are sold, wait until winner ticket would be picked")}if(lottery.avialableTickets<=minRate){if(lottery.maxRate>lottery.avialableTickets){lottery.minRate=lottery.avialableTickets}else{lottery.minRate=lottery.maxRate}}}function addHexPrefix(totalLength,suffix){var sLength=suffix.length;var prefixLength=totalLength-sLength;return Array(prefixLength+1).join("0")+suffix}function addEvents(contractLottery){$("#alert .close_bg").on("click",function(){$("#alert").stop(true,false).animate({opacity:0},200,"easeInQuint").fadeOut(0)});$("#takeHistoryButt").on("click",function(){$(this).toggleClass("open")});$(".transferFunds").on("click",function(){if(account==undefined){showAlert(0,"Please log into metamask and reload this page");return}if($(".tickets-list li.selected").length<1){showAlert(3e3,"Select tickets");return}var ticketsNums=[];$(".tickets-list li.selected").each(function(){ticketsNums.push($(this).data("num"))});var tickets=new BN(parseInt($(".tickets-list li.selected").length),10);var ethAmountToSend=lottery.ticketPrice.mul(tickets);contractLottery.buyTicket(activeRoom,ticketsNums,referal,{from:account,value:ethAmountToSend}).then(function(txHash){showAlert(3e3,"Transaction sent: "+txHash);console.log("Transaction sent");console.dir(txHash);var ticketsBought={};if(typeof Storage!=="undefined"){if(!localStorage.getItem("ticketsBought")){ticketsBought[activeRoom]=ticketsNums;ticketsBought["cashTime"]=1*60*1e3+Date.now();localStorage.setItem("ticketsBought",JSON.stringify(ticketsBought))}else{ticketsBought=localStorage.getItem("ticketsBought");ticketsBought=JSON.parse(ticketsBought);if(ticketsBought[activeRoom]!=undefined){for(var t in ticketsNums){ticketsBought[activeRoom].push(ticketsNums[t])}}else{ticketsBought[activeRoom]=ticketsNums}ticketsBought["cashTime"]=1*60*1e3+Date.now();localStorage.setItem("ticketsBought",JSON.stringify(ticketsBought))}}else{console.log("local storage error")}$(".tickets-list li.selected").removeClass("selected").addClass("my-tickets")}).catch(console.error)})}function renderLotteryData(players){$(".soldEth").text(lottery.soldEth);$(".maxEth").text(lottery.maxEth);$(".maxTickets").val(lottery.maxTickets);$(".ticketPrice").val(lottery.ticketPriceEth+" ETH");$(".rule .max").text(lottery.maxRate);$(".countTickets").prop("max",lottery.maxRate);$(".countTickets").prop("min",lottery.minRate);$(".toWin").val(lottery.minRate*100/lottery.maxTickets+" %");$(".members .scroll").html("");for(var i=0;i<players.resultLength.toString(10);i++){var paddr=players[1][i];var pinv=weiToEth(lottery.ticketPrice.mul(players[2][i]),"ether");var pwin=pinv/lottery.maxEth;if(account==paddr){var playerTemp="<span><p><a href='"+explorerLink+paddr+"' target='_blank' style='color:#FFAA00'>"+paddr+"</a></p><p>Total invested: <b>"+pinv+" ETH</b></p><p>Chance to win: <b>"+parseInt(pwin*100)+"%</b></p></span>"}else{var playerTemp="<span><p><a href='"+explorerLink+paddr+"' target='_blank'>"+paddr+"</a></p><p>Total invested: <b>"+pinv+" ETH</b></p><p>Chance to win: <b>"+parseInt(pwin*100)+"%</b></p></span>"}$(".members .scroll").append(playerTemp)}}function renderRangeSliders(){console.log(lottery.minRate);console.log(lottery.maxRate);if(lottery.minRate>=lottery.maxRate){$("#slider-range-min, .rule").fadeOut();$(".countTickets").val(lottery.maxRate)}if(lottery.maxRate<1&&lottery.maxRate>0){showAlert(1e4,"room data is incorrect");$(".transferFunds").fadeOut()}$("input[type$='number']").on("blur",function(){var value=$(this).val();var max=$(this).attr("max");var min=$(this).attr("min");if(value!==""){if(parseInt($(this).val())<parseInt(min)){$(this).val(Math.max(value,min))}if(parseInt($(this).val())>parseInt(max)){$(this).val(Math.min(value,max))}}});$("#countTickets").on("input propertychange",function(){var value=$(this).val();var max=$(this).attr("max");if(value!==""&&value.indexOf(".")===-1){$(this).val(Math.max(Math.min(value,max),-max))}$slider.slider("option","value",$(this).val());$(".ticketPrice").val($(this).val()*lottery.ticketPriceEth+" ETH");$(".toWin").val($(this).val()*100/lottery.maxTickets+" %")})}function renderWinners(contractLottery){contractLottery.getWinners(0).then(function(winners){$(".lott-history-list").html("");for(var w in winners[0]){if(winners[1][w]!=0){$(".lott-history-list").prepend("<span><p>Winner: <a href='"+explorerLink+winners[1][w]+"' target='_blank'>"+winners[1][w]+"</a></p><p>Winning amount: <b>"+weiToEth(winners[0][w],"ether")+" ETH</b></p><p>Ticket number: <b>"+(parseInt(winners[3][w])+1)+"</b></p><p>Сhance to win: <b>"+winners[4][w]+" %</b></p><p>"+timeConverter(winners[2][w])+"</p></span>")}}})}function timeConverter(UNIX_timestamp){var a=new Date(UNIX_timestamp*1e3);var months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];var month=months[a.getMonth()];var date=a.getDate();var hour=a.getHours();var min=a.getMinutes();var sec=a.getSeconds();var time=date+" "+month+" "+hour+":"+min+":"+sec;return time}function renderRooms(rooms){$(".room-list ul span.rooms").html("");for(var r in rooms){var timeActivity,activeClass="";if(r==activeRoom){var activeClass="active-list-rooms"}if(rooms[r].lastActivity==0){timeActivity="---"}else{timeActivity=timeConverter(rooms[r].lastActivity)}var linkRef="";if(referal!==null&&referal!=="0x0000000000000000000000000000000000000000"){linkRef="&ref="+referal}$(".room-list ul span.rooms").append("<a href='/?room="+r+linkRef+"'><li class="+activeClass+"><p class='list-jackpot'>Jackpot: "+weiToEth(rooms[r].prize,"ether")+" ETH</p><p>ticket price: <b>"+weiToEth(rooms[r].price,"ether")+" ETH</b></p><p>tickets left: <b>"+rooms[r].tickets.sub(rooms[r].ticketsBought)+"</b></p><p>activity: <b>"+timeActivity+"</b></p></li></a>")}}function addRefLink(){$("#ref-link").text(window.location.protocol+"//"+window.location.host+"/?ref="+account);$(".referal-link").fadeIn(0);$(".referal-link p").on("click",function(){copyToClipboard("#ref-link");showAlert(3e3,"Your referal link is copied to the clipboard")})}function copyToClipboard(element){var $temp=$("<input>");$("body").append($temp);$temp.val($(element).text()).select();document.execCommand("copy");$temp.remove()}function showAlert(secs,text){$("#alert p").text(text);$("#alert").fadeIn();if(secs!==0){$("#alert").stop(true,false).animate({opacity:1},200,"easeOutExpo").animate({opacity:1},secs).animate({opacity:0},1e3,"easeInQuint").fadeOut()}else{$("#alert").stop(true,false).animate({opacity:1},200,"easeOutExpo")}}function multFloats(a,b){var atens=Math.pow(10,String(a).length-String(a).indexOf(".")-1),btens=Math.pow(10,String(b).length-String(b).indexOf(".")-1);return a*atens*(b*btens)/(atens*btens)}function show(r,c){var run=document.getElementById(r);var close=document.getElementById(c);if(run.style.display==""){run.style.display="none";close.style.display=""}else{run.style.display="";close.style.display="none"}}