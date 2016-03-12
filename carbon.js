var itemList = {
    itemArray: [], //lagrar projektdata
	storageKey: "",

	init : function(key) {     
		this.storageKey = key;
		this.itemArray = JSON.parse(window.localStorage.getItem(key));
        //console.log(this.itemArray);
        if(this.itemArray == undefined) itemList.exampledata();
        else if(this.itemArray == null) itemList.exampledata();
        //åtgärd(er) för att slippa filtrerings-crash
        //console.log(this.itemArray.length);
        for (var index = 0, len = this.itemArray.length; index < len; index++) {
            item = this.itemArray[index];
            this.set_calculated_values(item.id);
        }
        
        window.localStorage.setItem(this.storageKey, JSON.stringify(this.itemArray));
            
	},
	
    set_calculated_values : function (id){
        item = this.get_item(id);
        //var weekDays = [ "?", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];
        //åtgärder för undefined värden
        //item.weekday =  weekDays[moment(item.finish_date,"YYYY-MM-DD").format("E")];
        //item.week =  moment(item.finish_date,"YYYY-MM-DD").week();
        //if(item.finish_date != undefined && item.finish_date != "" && item.price != undefined && item.price != "") item["sum"] =  (parseFloat(item.amount)*parseFloat(item.price)).toFixed(2); 
    },

     save_to_storage : function(item){
    	window.localStorage.setItem(this.storageKey, JSON.stringify(this.itemArray));
	},
    /*
    save_array : function() {   
        window.localStorage.setItem(this.storageKey, JSON.stringify(this.itemArray)); 
	},
	*/
    exampledata : function() {   
        this.itemArray=[];
        window.localStorage.setItem(this.storageKey, JSON.stringify(this.itemArray)); 
    },

	get_item : function(item_id){
		return this.itemArray.filter(function (item){
			return item.id == item_id;
		})[0];
	},
    
    get_all_items : function(){
    	return this.itemArray;
	},

	
	get_last_id : function(){
		last_id = Math.max.apply(Math,this.itemArray.map(function(item){return item.id;}));
		if (last_id=="-Infinity") last_id=0; //om inget objekt är skapat ännu
		return last_id;
	},
	

	add_item : function(item){
		this.itemArray.push(item);
		window.localStorage.setItem(this.storageKey, JSON.stringify(this.itemArray));
	},
	
    remove_item : function(id){
    	for(var i in this.itemArray){
			if(this.itemArray[i].id==id){
				this.itemArray.splice(i,1);
				break;
				}
		}
		window.localStorage.setItem(this.storageKey, JSON.stringify(this.itemArray));
	},
	
    
    set_item_field : function(id, field, value){
        var weekDays = [ "?", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];
        this.get_item(id)[field] = value;
        this.get_item(id)["last_update"] = moment().format('YYYY-MM-DD HH:mm:ss');  
        this.get_item(id)["weekday"] =  weekDays[moment(this.get_item(id)["finish_date"],"YYYY-MM-DD").format("E")];
        this.set_calculated_values(id);
        window.localStorage.setItem(this.storageKey, JSON.stringify(this.itemArray));
	},
    
   
	quick_add : function(title){
	    
        var item = {};
        
        item["title"] = title;
        
        //lägga till startdate till objektet
    	item["start_date"] = moment().format('YYYY-MM-DD HH:mm:ss');
        
        //sätta last_update
        item["last_update"] = moment().format('YYYY-MM-DD HH:mm:ss');
        
		//lägga till id till objektet
		item["id"] = itemList.get_last_id()+1;
        
        item["amount"] = 1;
        
        item["status"] = "open";
        
        item["type"] = "grocery";
        
        //lägga till objekt i listan
		this.add_item(item);
    },
    
    copy : function(id){
        
        var item = {};
        var item_to_copy = this.get_item(id);
        
        
        //lägga till startdate till objektet
    	item["start_date"] = moment().format('YYYY-MM-DD HH:mm:ss');
        
        //sätta last_update
        item["last_update"] = moment().format('YYYY-MM-DD HH:mm:ss');
        
		//lägga till id till objektet
		item["id"] = itemList.get_last_id()+1;
        
        item["status"] = "open";
        item["amount"] = item_to_copy["amount"];
        item["price"] = item_to_copy["price"];
        item["title"] = item_to_copy["title"];
        item["store"] = item_to_copy["store"];
        item["notes"] = item_to_copy["notes"];
        item["sum"] = item_to_copy["sum"];
        
        //lägga till objekt i listan
		this.add_item(item);
    },
    
    add_from_form : function(form_id){
    	//skapa objekt av formdata
		var temp = $( form_id ).serializeArray();
		var item = {};
		for(var i = 0; i <temp.length;i++){
			temp2 = temp[i];
			item[temp2["name"]] = temp2["value"];
		}
		
		//lägga till startdate till objektet
		item["start_date"] = moment().format('YYYY-MM-DD HH:mm:ss');
        
        //sätta last_update
        item["last_update"] = moment().format('YYYY-MM-DD HH:mm:ss');
        
		//lägga till id till objektet
		item["id"] = itemList.get_last_id()+1;
        
        //lägga till objekt i listan
		this.add_item(item);
        
        //fixa veckodag, summa, etc
        this.set_calculated_values(item.id);
    
	},
    
	edit_from_form : function(form_id){
		
        //skapa temporärt itemobjekt av formdata
		var temp = $( form_id ).serializeArray();
		var item_temp = {};
		for(var i = 0; i <temp.length;i++){
			temp2 = temp[i];
			item_temp[temp2["name"]] = temp2["value"];
		}
        
        
        var item = this.get_item(item_temp.id);
        
        for (var key in item_temp) {
            item[key] = item_temp[key];
        }
        
        //sätta last_update
        item["last_update"] = moment().format('YYYY-MM-DD HH:mm:ss');
        
        
        //fixa veckodag, summa, etc
        this.set_calculated_values(item.id);
        
		//ta bort finish date om datum inte är satt
		//if (item_temp['finish_date'] == "") delete item_temp['finish_date'];
        
        //console.log(item_temp);
        //console.log(item);
        window.localStorage.setItem(this.storageKey, JSON.stringify(this.itemArray));
	},

}


/*** Copyright 2013 Teun Duynstee Licensed under the Apache License, Version 2.0 ***/
firstBy=(function(){function e(f){f.thenBy=t;return f}function t(y,x){x=this;return e(function(a,b){return x(a,b)||y(a,b)})}return e})();
