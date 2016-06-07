var itemList = new Carbon("mangajo");
var itemHistory = new Carbon("mangajo-history");
refresh_groceries();


// .subitem-left (visa edit-läge)
$(document).on('click', ".subitem-center .title", function() {
	
	id = $(this).parent().parent().find(".item_id").text();
	edit_item = itemList.get_item(id);

	$(".menu-title").html("Edit: "+edit_item.title);
    
    for (var key in edit_item) {
        $('#edit-groceries-form [name="'+key+'"]').val(edit_item[key]);
    }
    
    history_items=itemHistory.get_all();
    console.log(history_items);
    
    history_items=history_items.query("title", "==", edit_item.title);
    console.log(history_items);
    
    $("#history_items").empty();    
      history_items.forEach(function(item) {
		var template = $('#history_items_template').html();
		var html = Mustache.to_html(template, item);
		$("#history_items").append(html);
	});
		
    $(".page").hide();
    $("#edit").show();
	
	$('.more').hide();
	$('.more-button').show();
    
    window.scrollTo(0, 0);
});


//Quick add
$(document).on('click', "#quick_add", function() {
    if ($('#quick_search').val() != ""){
        var title = $('#quick_search').val();
        var item = {title: title, status: "open", type: "grocery"};
        itemList.add_item(item);
        $('#quick_search').val("");
        refresh_groceries();
        $("#quick_search").focus();  
    }
});


// Enter i quick add
$("#quick_search").keyup(function(event){
    if(event.keyCode == 13){
        $("#quick_add").click();
        $("#quick_search").focus();  
    }
});


// .save-button
$(document).on('click', ".save-button", function() {
    
    itemList.edit_from_form("#edit-groceries-form");
    refresh_groceries();

    //var scroll_offset = $(".item_id:contains('"+id+"')").parent().offset().top-100;
    //window.scrollTo(0, scroll_offset);
});


// .more-button
$(document).on('click', ".more-button", function() {
	$('.more').show();
	$('.more-button').hide();
});


// .groceries-button
$(document).on('click', "#groceries-button", function() {
    $(".page").hide();
    $("#search").show();
    refresh_groceries();
});
 
 
// .cancel-button
$(document).on('click', ".cancel-button", function() {
    
    itemList.edit_from_form("#edit-groceries-form");
    refresh_groceries();
    
    //var scroll_offset = $(".item_id:contains('"+id+"')").parent().offset().top-100;
    //window.scrollTo(0, scroll_offset);
});

// .delete-button
$(document).on('click', ".delete-button", function() {
	id = $(".item-id").val();
	var type = itemList.get_item(id).type;
    if (confirm('Delete "'+itemList.get_item(id).title+'"?')==true) {
    itemList.remove_item(id);
    refresh_groceries();
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
    itemHistory.add_item(itemList.get_item(item_id));
    refresh_groceries();
});


//refresh groceries
function refresh_groceries(){
  
    var query = $("#quick_search").val();
    
    open_items=itemList.get_all();
    open_items=open_items.query("status", "==", "open"); 
    //open_items=open_items.query("prio", "==", undefined);
    open_items=open_items.query("title", "contains", query);
    
    finished_items=itemList.get_all();
    finished_items=finished_items.query("status", "==", "finished"); 
    //finished_items=finished_items.query("prio", "==", undefined);
    finished_items=finished_items.query("title", "contains", query);
    
    //sortera fltered items
    open_items.sort(
        firstBy(function (v1, v2) { return v1.notes<v2.notes ? -1 : v1.notes>v2.notes ? 1 : 0;}) 
	);

    finished_items.sort(
        firstBy(function (v1, v2) { return v1.days_left<v2.days_left ? -1 : v1.days_left>v2.days_left ? 1 : 0;}) 
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
        item.days_left = parseInt(item.refill) - item.days_ago;
        var template = $('#finished_items_template').html();
		var html = Mustache.to_html(template, item);
		$("#finished_items").append(html);
	});
	
  	//om inga items hittas
	if (open_items.length == 0 && finished_items.length == 0) $("#open_items").append("<div class='empty'>No items here</div>");
    
    $(".page").hide();
	$("#search").show();
}

// gear button (preferences)
$(document).on('click', ".pref-button", function(){  
        $(".page").hide();
		$("#menu").show();
});

// #import-button
$(document).on('click', "#import-button", function() {
    if (confirm('All current data will be deleted?')==true) {
        window.localStorage.setItem(itemList.storageKey, $('#import').val());
       	refresh_groceries();
    }
});
 
// #export all-button
$(document).on('click', "#export-button", function() {
    var items = itemList.get_all();
    var items_string = JSON.stringify(items);
    console.log(items);
    console.log(items_string);
    $("#export").html(items_string);
    $(".page").hide();
    $("#export").show();
});


