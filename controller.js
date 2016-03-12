var latest_swipe;
var id;
 
itemList.init("mangajo");
//console.log(itemList.itemArray);
if(itemList.itemArray == undefined) itemList.exampledata();
if(itemList.itemArray == null) itemList.exampledata();
if(itemList.itemArray == "") itemList.exampledata();
refresh_groceries();
$("#date").val(moment().format('YYYY-MM-DD HH:mm:ss'));
         
         
// Manuell sortering av meals i lista
var list = document.getElementById('meal_items');
//Sortable.create(list);
Sortable.create(list, {handle: '.subitem-right',onSort: function (evt) {
    console.log(evt.oldIndex + ' -> ' + evt.newIndex);
    reorder(evt.oldIndex, evt.newIndex);
}});     

// Manuell sortering av öppna varor
var list2 = document.getElementById('open_items');
Sortable.create(list2,  {handle: '.subitem-right'});

function reorder(from_pos, to_pos){
    console.log("hej");
    var meal_items=itemList.get_all_items(); 
    meal_items=meal_items.query("type", "==", "meal");
    meal_items.sort(
        firstBy(function (v1, v2) { return v1.order - v2.order;}) 
        //firstBy(function (v1, v2) { return v1.title.localeCompare(v2.title); })
    );
    //console.log(items);
    var offset = 0;
    
    for (var index = 0, len = meal_items.length; index < len; index++) {
        item = meal_items[index];
        
        if (from_pos >= to_pos){
            if(index == (to_pos)) offset++;
        }
        else{
            if (index == (to_pos+1)) offset++;
        }
        
        if(index == from_pos) offset--;
        item.order = index + offset;
        if(index == from_pos) item.order = to_pos;
         
    }
    
    itemList.save_to_storage(); 
}


// .subitem-left (visa edit-läge)
$(document).on('click', ".subitem-center .title", function() {
	
	id = $(this).parent().parent().find(".item_id").text();
	edit_item = itemList.get_item(id);

	$(".menu-title").html("Edit: "+edit_item.title);
	
 	$("input.item-id").val(id);
 	$("input.item-title").val(edit_item.title);
 	$("textarea.item-notes").val(edit_item.notes);
    $(".status").val(edit_item.status);
    
    $(".amount").val(edit_item.amount);
    $(".price").val(edit_item.price);
    $(".store").val(edit_item.store);
    $(".item-prio").val(edit_item.prio);
    $(".order_input").val(edit_item.order);
    $(".start_date").val(edit_item.start_date);
    $(".finish_date_input").val(edit_item.finish_date);
    $(".type_input").val(edit_item.type);
    $(".item-refill-time").val(edit_item.refill);
    $(".item-notes").val(edit_item.notes);
    //$(".category").val(edit_item.category);
		
	
//öppna rätt sida
    $(".page").hide();
    if(edit_item.type=="meal") $("#edit-meal").show(); 
    else $("#edit").show();
	
	$('.more').hide();
	$('.more-button').show();
    
    window.scrollTo(0, 0);
    
});

/*
//swipe right
    $("body").on('swiperight',  function(){ 
    	$(".page").hide();
        $("#meals").show();
        refresh_groceries();   
	});

//swipe left
    $("body").on('swipeleft',  function(){ 
        $(".page").hide();
        $("#meals").show();
        refresh_meals(); 
	});

*/

//Quick add
$(document).on('click', "#quick_add", function() {
    if ($('#quick_search').val() != "")
        itemList.quick_add($('#quick_search').val());
    $('#quick_search').val("");
    refresh_groceries();
    $("#quick_search").focus();  
  
});

//New
$(document).on('click', "#new-button", function() {
    $(".page").hide();
    $("#new").show();
});


//Enter i quick add
$("#quick_search").keyup(function(event){
    if(event.keyCode == 13){
        $("#quick_add").click();
        $("#quick_search").focus();  
    }
});

// .subitem-center (visa subitems)
/*$(document).on('click', ".subitem-center", function() {
	var current_id = $(this).parent().find(".item_id").text();
	view_item (current_id);
});*/

// .add-button
$(document).on('click', ".add-button", function() {
    itemList.add_from_form("#new-item-form");
	refresh_meals();
});


// .save-button
$(document).on('click', ".save-button", function() {
    if ($(".type_input").val()=="meal") {
        itemList.edit_from_form("#edit-meal-form");
    	refresh_meals();
    }
    else {
        itemList.edit_from_form("#edit-groceries-form");
        refresh_groceries();
    }
    //var scroll_offset = $(".item_id:contains('"+id+"')").parent().offset().top-100;
    //window.scrollTo(0, scroll_offset);
});


// .more-button
$(document).on('click', ".more-button", function() {
	$('.more').show();
	$('.more-button').hide();
});


// .meals-button
$(document).on('click', "#meals-button", function() {
    $(".page").hide();
    $("#meals").show();
    refresh_meals();
});


// .groceries-button
$(document).on('click', "#groceries-button", function() {
    $(".page").hide();
    $("#search").show();
    refresh_groceries();
});
 
 
// .cancel-button
$(document).on('click', ".cancel-button", function() {
    if ($(".type_input").val()=="meal") {
        itemList.edit_from_form("#edit-meal-form");
        refresh_meals();
    }
    else {
        itemList.edit_from_form("#edit-groceries-form");
        refresh_groceries();
    }
    //var scroll_offset = $(".item_id:contains('"+id+"')").parent().offset().top-100;
    //window.scrollTo(0, scroll_offset);
});

// .delete-button
$(document).on('click', ".delete-button", function() {
	id = $(".item-id").val();
	var type = itemList.get_item(id).type;
    if (confirm('Delete "'+itemList.get_item(id).title+'"?')==true) {
    itemList.remove_item(id);
	if (type=="meal") refresh_meals();
    else refresh_groceries();
    }
});


// #increase
$(document).on('click', "#increase", function() {
    var item_id = $(this).parent().parent().find(".item_id").html();
    amount = parseInt(itemList.get_item(item_id).amount);
    amount = amount + 1;
    itemList.set_item_field(item_id, "amount", amount);
    refresh_groceries();
});


// #decrease
$(document).on('click', "#decrease", function() {
    var item_id = $(this).parent().parent().find(".item_id").html();
    amount = parseInt(itemList.get_item(item_id).amount);
 
    
    if (amount == undefined) itemList.set_item_field(item_id, "amount", 0);
    amount = amount - 1;
    if (amount > 0) itemList.set_item_field(item_id, "amount", amount);
    else itemList.set_item_field(item_id, "amount", 0);
    refresh_groceries();
});


// #tolist
$(document).on('click', "#tolist", function() {
    var item_id = $(this).parent().parent().find(".item_id").html();
    itemList.set_item_field(item_id, "status",  "open");
    if($('#quick_search').val().length > 0){    
        $('#quick_search').val("");
        $("#quick_search").focus();  
    }
    refresh_groceries();
    
});



// #purchase
$(document).on('click', "#purchase", function() {
    var item_id = $(this).parent().parent().find(".item_id").html();
    itemList.set_item_field(item_id, "finish_date",  moment().format('YYYY-MM-DD HH:mm:ss'));
    itemList.set_item_field(item_id, "status",  "finished");
    refresh_groceries();
});


//refresh groceries
function refresh_groceries(){
  
    var query = $("#quick_search").val();
    
    open_items=itemList.get_all_items();
    open_items=open_items.query("status", "==", "open"); 
    open_items=open_items.query("prio", "==", undefined);
    open_items=open_items.query("title", "contains", query);
    
    finished_items=itemList.get_all_items();
    finished_items=finished_items.query("status", "==", "finished"); 
    finished_items=finished_items.query("prio", "==", undefined);
    finished_items=finished_items.query("title", "contains", query);
    
    
    //sortera fltered items
    open_items.sort(
        firstBy(function (v1, v2) { return v1.notes<v2.notes ? -1 : v1.notes>v2.notes ? 1 : 0;}) 
	);

    finished_items.sort(
        firstBy(function (v1, v2) { return v1.finish_date>v2.finish_date ? -1 : v1.finish_date<v2.finish_date ? 1 : 0;}) 
    );


  	//mustache output
   	$("#open_items").empty();    
  	open_items.forEach(function(item) {
		var template = $('#open_items_template').html();
		var html = Mustache.to_html(template, item);
		$("#open_items").append(html);
	});
	
    
    //mustache output
    $("#finished_items").empty();    
  	finished_items.forEach(function(item) {
        item.days_ago = parseInt((moment()-moment(item.finish_date))/3600/1000/24);
        var template = $('#finished_items_template').html();
		var html = Mustache.to_html(template, item);
		$("#finished_items").append(html);
       
	});
	
  	//om inga items hittas
	if (open_items.length == 0 && finished_items.length == 0) $("#open_items").append("<div class='empty'>No items here</div>");
    
    $(".page").hide();
	$("#search").show();
}

//refresh meals
function refresh_meals(){
  
    //var query = $("#quick_search").val();
    
    meal_items=itemList.get_all_items(); 
    
    meal_items=meal_items.query("type", "==", "meal");
    
    //meal_items=meal_items.query("title", "contains", query);
    
    //sortera fltered items
    meal_items.sort(
        firstBy(function (v1, v2) { return v1.order - v2.order;}) 
        //firstBy(function (v1, v2) { return v1.title.localeCompare(v2.title); })
    );


  	//mustache output
   	$("#meal_items").empty();    
  	meal_items.forEach(function(item) {
		var template = $('#meals_items_template').html();
		var html = Mustache.to_html(template, item);
		$("#meal_items").append(html);
	});
	
    
  	//om inga items hittas
	if (meal_items.length == 0) $("#meal_items").append("<div class='empty'>No items here</div>");
    
    $(".page").hide();
	$("#meals").show();
}

