FTRPG.Model.Exception = function (message) {
    this.message = message;
    if(console.error){
        console.error(message)
    }
};

FTRPG.Model.Exception.prototype = {
    message: "",
    toString: function(){
        return message;
    }
};