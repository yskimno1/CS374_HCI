// This allows the Javascript code inside this block to only run when the page
// has finished loading in the browser.


$( document ).ready(function() {
  var textinput = document.getElementById("pr2__answer");
  textinput.focus();
  var t = document.getElementById("pr2__submit");
  var country_capital_pairs = pairs;
  var cntry = document.getElementById("pr2__question");
  var index = Math.floor(Math.random() * pairs.length);
  var info = country_capital_pairs[index].country;
  cntry.innerHTML = info;

  var capitalInfos = new Array;
  for(var i=0; i<country_capital_pairs.length; i++){
    capitalInfos.push(country_capital_pairs[i].capital);
  }
  var newElement;

  t.onclick = function(){
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
//  $('input').keyup(function(e) {
//    if (e.keyCode == 13) refresh();
//  });
  $("#pr2__answer").autocomplete(
    {minLength: 2}, {source: capitalInfos},
    {select: function(event, ui){
      $("#pr2__answer").val(ui.item.value);
      event.preventDefault();
      t.click();
    }}
  );

  $(document).on('click','.deletion',function(){
    var rmvtr = $(this).closest("tr");
    rmvtr.remove();
  })

  function refresh(){
    newElement = document.createElement("tr");
    if(textinput.value == country_capital_pairs[index].capital){
      $("<tr><td>"+ info +"</td><td>"+ textinput.value +"</td><td>" + "<i class= 'fa fa-check'> </i> <button class = 'deletion'> Delete </button>" + "</td></tr>").insertAfter($("#divide"));
      $("#pr2__table > tbody > tr:eq(3)").addClass("correctblue");

      if($('input[id="radio_3"]').is(':checked')){
        $("#radio_1").click();
      }
    }
    else{
      $("<tr>><td>"+ info +"</td><td>"+ textinput.value +"</td><td>" +country_capital_pairs[index].capital + "<button class='deletion'> Delete </button>" + "</td></tr>").insertAfter($("#divide"));
      $("#pr2__table > tbody > tr:eq(3)").addClass("incorrectred");
      $("#pr2__table > tbody > tr:eq(3) > td:eq(1)").addClass("midline");
      if($('input[id="radio_2"]').is(':checked')){
        $("#radio_1").click();
      }
    }
    textinput = document.getElementById("pr2__answer");
    index = Math.floor(Math.random() * pairs.length);
    info = country_capital_pairs[index].country;
    cntry.innerHTML = info;

    document.getElementById("pr2__answer").value = "";
    textinput.focus();
    shuffleArray(capitalInfos);
  }

  function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
  }


//---------------------------------

})
