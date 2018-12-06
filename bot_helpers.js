function getUrl( hostName, pathToData, callBack )
{
    var data = '';

    var request = http.request( { host: hostName, path: pathToData }, function (res) {
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
           callBack( data );
        });
    });

    request.on('error', function (e) {
        logIt(e.message);
    });

    request.end();
}

// Log certain items or errors
function logIt(message, isError = false)
{
  if (!isError)
  {
    console.log(`[${config.appname}] ` + displayTime() + "> " + message);
  }
  else
  {
    console.error(`[${config.appname}] ` + displayTime() + "> " + message);
  }
}

// Format Timestamps
function displayTime() {
    var str = "";
    var currentTime = new Date()
    var hours = currentTime.getHours()
    var minutes = currentTime.getMinutes()
    var seconds = currentTime.getSeconds()

    if (minutes < 10)
    {
        minutes = "0" + minutes
    }

    if (seconds < 10)
    {
        seconds = "0" + seconds
    }

    str += hours + ":" + minutes + ":" + seconds + " ";

    if(hours > 11)
    {
        str += "PM"
    }
    else
    {
        str += "AM"
    }
    return str;
}

// Remove item from array when callback is needed.
function arrayRemove(arr, item)
{
    for (var i = arr.length; i--;)
    {
        if (arr[i] === item)
        {
            arr.splice(i, 1);
            logIt("Removed " + item + " from " + arr + " array at index [" + i + "]");
        }
    }
}

// Is passed variable a number?
function isNumeric(n)
{
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// Is passed variable or array empty
function isEmpty(obj)
{
    for(var key in obj)
    {
        if(obj.hasOwnProperty(key))
        {
            return false;
        }
    }
    return true;
}

// Prototype Extensions
// Does an array contain an item?
Array.prototype.contains = function(obj)
{
    return this.indexOf(obj) > -1;
};

// Remove all instances of an item from an array
Array.prototype.remove = function(item)
{
    for (var i = this.length; i--;)
    {
        if (this[i] === item)
        {
            this.splice(i, 1);
        }
    }
}
