// This allows the Javascript code inside this block to only run when the page
// has finished loading in the browser.
var pairs = new Array()

$( document ).ready(function() {
  var each_pair
  $.when($.ajax("https://s3.ap-northeast-2.amazonaws.com/cs374-csv/country_capital_pairs.csv", {
    type : "GET",
    dataType : "text",
    success : function(result) {
      var roughData = result.split(/\n/)
      for(var i=1; i<roughData.length; i++){
        var temp = roughData[i].split(',')
        each_pair = new Object()
        each_pair.country = temp[0]
        each_pair.capital = temp[1].trim()
        pairs.push(each_pair)
      }
    }
  })).then( function(){
    var textinput = document.getElementById("pr2__answer");
    var t = document.getElementById("pr2__submit");
    var cntry = document.getElementById("pr2__question");
    var index = Math.floor(Math.random() * pairs.length);
    var info = pairs[index].country;

    var capitalInfos = new Array;
    document.getElementById("place").src = "https://www.google.com/maps/embed/v1/place?key=AIzaSyDzhYEvlRg4eficENK9eeX6UeEAwBs6n9c &q="+info+"&maptype=satellite"

    var worklist = new Array;
    var workdata = new Array;
    cntry.innerHTML = info;
    textinput.focus();
    for(var i=0; i<pairs.length; i++){
      capitalInfos.push(pairs[i].capital);
    }
    var newElement;
/*--------------------------------------------------*/
    var config = {
      apiKey: "AIzaSyBrOzdc7GLqF7raHvJ0cy_r_zhY8b394N8",
      databaseURL: "https://cs374pr3-8a786.firebaseio.com/",
    }
    firebase.initializeApp(config)
    var database = firebase.database()
    var dataRef = database.ref('Data')
    var undoRef = database.ref('UndoDataList')
    var undoworkRef = database.ref('UndoWorkList')
    //var clearRef = database.ref('UndoforClear')

    var keyinfo = null
    $(document).on('click','.pointer',function(){

      var text = $(this).text()

      document.getElementById("place").src = "https://www.google.com/maps/embed/v1/place?key=AIzaSyDzhYEvlRg4eficENK9eeX6UeEAwBs6n9c &q="+text+"&maptype=satellite"
    })


    undoRef.once('value', function(snapshot){
      var dataObject = snapshot.val()
      if(dataObject != null) renderUndoData(dataObject)
    })

    undoRef.on('value', function(snapshot){
      var dataObject = snapshot.val()
      if(dataObject == null) document.getElementById("pr3__undo").disabled = true;
      else document.getElementById("pr3__undo").disabled = false;
    })
    dataRef.on('value', function(snapshot){
      var dataObject = snapshot.val()
      if(dataObject == null) document.getElementById("pr3__clear").disabled = true
      else document.getElementById("pr3__clear").disabled = false;
    })

    undoworkRef.once('value', function(snapshot){
      var dataObject = snapshot.val()
      if(dataObject != null) renderUndowork(dataObject)
    })
    dataRef.once('value', function(snapshot){
      var dataObject = snapshot.val()
      if(dataObject != null) renderData(dataObject)
    })

    function renderUndoData(dataObject){
      Object.keys(dataObject).forEach(function(index){
          workdata.push(dataObject[index])
      })
    }
    function renderUndowork(dataObject){
      Object.keys(dataObject).forEach(function(index){
          worklist.push(dataObject[index])
      })
    }
    function renderData(dataObject){
      Object.keys(dataObject).forEach(function(key){
        addnew(dataObject[key].country, dataObject[key].capital, dataObject[key].correctiveness, dataObject[key].correctcapital)
        $("#pr2__table > tbody > tr:eq(3) > td:eq(2) > .deletion").attr("id", key)
      })
    }

    function addData(country, capital, correctiveness, correctcapital) {
      var newObject = {
        country: country,
        capital: capital,
        correctiveness : correctiveness,
        correctcapital : correctcapital
      }
      return dataRef.push(newObject)
    }

    /*-------------------------------------------------------*/
    t.onclick = function(event){
      event.preventDefault()
      var country = info
      var capital = textinput.value
      var correctiveness = 0
      if(capital == pairs[index].capital){
        correctiveness = 1
      }
      else{
        correctiveness = 0
      }
      var correctcapital = pairs[index].capital

      //$('.userinput').remove()
      var keyref = addData(country, capital, correctiveness, correctcapital)
      keyinfo = keyref.getKey()
      /*------------*/
      addnew(country, capital, correctiveness, correctcapital);
      $("#pr2__table > tbody > tr:eq(3) > td:eq(2) > .deletion").attr("id", keyinfo)
      addUndo(keyinfo, country, capital, correctiveness, correctcapital, "add", 3)
      refresh();
    }

    $("input:radio[name='radio']").click(function(){
      if($(this).attr('id') == "radio_1"){
        $(".correctblue").css("display", "");
        $(".incorrectred").css("display", "");
      }
      else if($(this).attr('id') == "radio_2"){

        $(".correctblue").css("display", "");
        $(".incorrectred").css("display", "none");
      }
      else{
        $(".correctblue").css("display", "none");
        $(".incorrectred").css("display", "");
      }
    })

    $("#pr2__answer").autocomplete(
      {minLength: 2}, {source: capitalInfos},
      {select: function(event, ui){
        $("#pr2__answer").val(ui.item.value);
        event.preventDefault();
        t.click();
      }}
    );

    $(document).on('click', '.reset', function(){
      $('.userinput').remove()
      dataRef.remove()
      undoRef.remove()
      undoworkRef.remove()

      worklist = []
      workdata = [];
      $("#radio_1").click();
    
    })
    $(document).on('click','.deletion',function(){
      var rmvtr = $(this).closest("tr");
      var keyvalue = $(this).attr("id")
      var rowindex = $(rmvtr[0].rowIndex)[0]

      //console.log(keyvalue)
      var td = rmvtr.children()
      var country = td.eq(0).text()
      var capital = td.eq(1).text()
      var correctcapital;
      var correctiveness = 0;
      pairs.forEach(function(temp){
        if(temp.country == country){
          correctcapital = temp.capital
        }
      })
      if(capital == correctcapital) correctiveness = 1
      addUndo(keyvalue, country, capital, correctiveness, correctcapital, "delete", rowindex)

      dataRef.child(keyvalue).remove()
      rmvtr.remove();
    })
    $(document).on('click', '.undo', function(){
      var work = worklist.pop()
      var recentWorkRef = undoworkRef.limitToLast(1);
      var recentDataRef = undoRef.limitToLast(1);
      recentWorkRef.once('value', function(snapshot){
        var dataObject = snapshot.val()
        Object.keys(dataObject).forEach(function(key){
          undoworkRef.child(key).remove()
        })
      })
      recentDataRef.once('value', function(snapshot){
        var dataObject = snapshot.val()
        Object.keys(dataObject).forEach(function(key){
          undoRef.child(key).remove()
        })
      })

      var record = workdata.pop()
      var insertpoint = record.rowindex-1;

      if(work == "add"){ // i have to delete 3rd row
        $("#pr2__table > tbody > tr:eq(3)").remove();
        var recentRef = dataRef.limitToLast(1);
        recentRef.once('value', function(snapshot){
          var dataObject = snapshot.val()
          Object.keys(dataObject).forEach(function(key){
            dataRef.child(key).remove()
          })
        })
      }

      else if(work == "delete"){ // i have to add row into rowindex
        if(record.correctiveness == 1){
          $("<tr class = 'userinput'><td>"+ record.country +"</td><td>"+ record.capital +"</td><td>" + "<i class= 'fa fa-check'> </i> <button class = 'deletion'> Delete </button>" + "</td></tr>").insertAfter($("#pr2__table > tbody > tr:eq('" + insertpoint + "')"));
          $("#pr2__table > tbody > tr:eq("+record.rowindex+")").addClass("correctblue");
          $("#pr2__table > tbody > tr:eq("+ record.rowindex +") > td:eq(0)").addClass("pointer");
        }
        else{
          $("<tr class = 'userinput'><td>"+ record.country +"</td><td>"+ record.capital +"</td><td>" + record.correctcapital + "<button class='deletion'> Delete </button>" + "</td></tr>").insertAfter($("#pr2__table > tbody > tr:eq('" + insertpoint + "')"));
          $("#pr2__table > tbody > tr:eq("+ record.rowindex +")").addClass("incorrectred");
          $("#pr2__table > tbody > tr:eq("+ record.rowindex +") > td:eq(1)").addClass("midline");
          $("#pr2__table > tbody > tr:eq("+ record.rowindex +") > td:eq(0)").addClass("pointer");
        }
        $("#pr2__table > tbody > tr:eq(" + record.rowindex + ")" + "> td:eq(2) > .deletion").attr("id", record.keyvalue)
        database.ref('Data/'+record.keyvalue).set({
          country: record.country,
          capital: record.capital,
          correctiveness : record.correctiveness,
          correctcapital : record.correctcapital
        })
      }
      else{ // clear

        Object.keys(record).forEach(function(data){
          if(record[data].correctiveness == 1){
            $("<tr class = 'userinput'><td>"+ record[data].country +"</td><td>"+ record[data].capital +"</td><td>" + "<i class= 'fa fa-check'> </i> <button class = 'deletion'> Delete </button>" + "</td></tr>").insertAfter($("#divide"));
            $("#pr2__table > tbody > tr:eq(3)").addClass("correctblue");
            $("#pr2__table > tbody > tr:eq(3) > td:eq(0)").addClass("pointer");
          }
          else{
            $("<tr class = 'userinput'><td>"+ record[data].country +"</td><td>"+ record[data].capital +"</td><td>" + record[data].correctcapital + "<button class='deletion'> Delete </button>" + "</td></tr>").insertAfter($("#divide"));
            $("#pr2__table > tbody > tr:eq(3)").addClass("incorrectred");
            $("#pr2__table > tbody > tr:eq(3) > td:eq(1)").addClass("midline");
            $("#pr2__table > tbody > tr:eq(3) > td:eq(0)").addClass("pointer");
          }
          $("#pr2__table > tbody > tr:eq(3)" + "> td:eq(2) > .deletion").attr("id", record[data].keyvalue)
          database.ref('Data/'+record[data].keyvalue).set({
            country: record[data].country,
            capital: record[data].capital,
            correctiveness : record[data].correctiveness,
            correctcapital : record[data].correctcapital
          })
        })
      }
      $("#radio_1").click();
    })

    $(document).on('click', '.alldeletion', function(){
      $('.userinput').remove()
      var clearinfo = new Object
      var count = 1
      dataRef.once('value', function(snapshot){
        var dataObject = snapshot.val()
        var index = 3
        Object.keys(dataObject).forEach(function(key){
          var undorecord = new Object

          undorecord.country = dataObject[key].country
          undorecord.capital = dataObject[key].capital
          undorecord.correctiveness = dataObject[key].correctiveness
          undorecord.correctcapital = dataObject[key].correctcapital
          undorecord.rowindex = index
          undorecord.keyvalue = key

          clearinfo['data'+count] = undorecord
          index += 1
          count += 1
        })
        dataRef.remove()

        workdata.push(clearinfo)
        worklist.push("clear")
        undoRef.push(clearinfo)
        undoworkRef.push("clear")

        $("#radio_1").click();
      })
    })

    function addUndo(keyvalue, country, capital, correctiveness, correctcapital, work, rowindex){
      var undorecord = new Object;
      undorecord.country = country
      undorecord.capital = capital
      undorecord.correctiveness = correctiveness
      undorecord.correctcapital = correctcapital
      undorecord.rowindex = rowindex
      undorecord.keyvalue = keyvalue

      workdata.push(undorecord)
      worklist.push(work)

      undoRef.push(undorecord)
      undoworkRef.push(work)
    }

    function addnew(country, capital, correctiveness, correctcapital){
      newElement = document.createElement("tr");
      if(correctiveness == 1){
        $("<tr class = 'userinput'><td>"+ country +"</td><td>"+ capital +"</td><td>" + "<i class= 'fa fa-check'> </i> <button class = 'deletion'> Delete </button>" + "</td></tr>").insertAfter($("#divide"));
        $("#pr2__table > tbody > tr:eq(3)").addClass("correctblue");
        $("#pr2__table > tbody > tr:eq(3) > td:eq(0)").addClass("pointer");
        if($('input[id="radio_3"]').is(':checked')){
          $("#radio_1").click();
        }
      }
      else{
        $("<tr class = 'userinput'><td>"+ country +"</td><td>"+ capital +"</td><td>" + correctcapital + "<button class='deletion'> Delete </button>" + "</td></tr>").insertAfter($("#divide"));
        $("#pr2__table > tbody > tr:eq(3)").addClass("incorrectred");
        $("#pr2__table > tbody > tr:eq(3) > td:eq(1)").addClass("midline");
        $("#pr2__table > tbody > tr:eq(3) > td:eq(0)").addClass("pointer");
        if($('input[id="radio_2"]').is(':checked')){
          $("#radio_1").click();
        }
      }
    }

    function refresh(){
      textinput = document.getElementById("pr2__answer");
      index = Math.floor(Math.random() * pairs.length);
      info = pairs[index].country;
      cntry.innerHTML = info;

      document.getElementById("pr2__answer").value = "";
      textinput.focus();
      shuffleArray(capitalInfos);
      document.getElementById("place").src = "https://www.google.com/maps/embed/v1/place?key=AIzaSyDzhYEvlRg4eficENK9eeX6UeEAwBs6n9c &q="+info+"&maptype=satellite"

    }

    function shuffleArray(array) {
      for (var i = array.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = array[i];
          array[i] = array[j];
          array[j] = temp;
      }
    }
  })
});
