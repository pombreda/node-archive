var ab = require('./archive_bindings');
var ar = new ab.ArchiveReader();
var sys = require('sys');
var Buffer = require('buffer').Buffer;

var buf = new Buffer(8000);

ar.addListener('ready', function() {
  sys.log('In ready function....');
  ar.nextEntry();
});

ar.addListener('entry', function(entry) {
  sys.log('path: '+ entry.getPath());
  sys.log('    size: '+ entry.getSize());
  sys.log('    mtime: '+ entry.getMtime());
  function reader(length, err) {
    if (!err) {
      if (length === 0) {
        entry.emit('end');
      }
      else {
        var b = buf.slice(0, length);
        entry.emit('data', b);
        entry.read(buf, reader);
      }
    }
    else {
      sys.log(err);
      entry.emit('end');
    }
  }
  entry.read(buf, reader);

  entry.addListener('data', function(data) { 
    sys.log("got data of length: "+ data.length);
  });

  entry.addListener('end', function() { 
    process.nextTick(function() {
      ar.nextEntry();
    });
  });
});

ar.openFile("nofile.tar.gz", function(err){
  if (err) {
    sys.log(err);
  }
});

