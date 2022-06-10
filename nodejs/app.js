var cassandra = require('cassandra-driver');
var async = require('async');

//Client object using cassandra-driver
const client = new cassandra.Client({
    contactPoints: ['scylla-node1', 'scylla-node2', 'scylla-node3'],
    localDataCenter: 'DC1',
    keyspace: 'catalog',
});

//Using async to control the order in which functions are executed
async.series([
    function connect(next) {
        console.log('Connecting to cluster');
        client.connect(next);
    },

    //Display all data
    function select(next) {
        const q = 'SELECT * FROM catalog.baseball_players';

        client.execute(q, function(err, res){
            if(err) return next(err);

            console.log('Data: ');
            for(let row of res) {
                console.log(row.first_name, ' ', row.last_name);
            }
            next();
        });
    },

    //Insert new row
    function insert(next) {
        console.log('Adding Aaron Judge');

        const q = 'INSERT INTO baseball_players (first_name, last_name, batting_average, team) VALUE (?, ?, ?, ?)';
        const params = ['Aaron', 'Judge', '.310', 'Yankees'];

        //Execute function of client object to send new data into Catalog table
        client.execute(q, params, next);
    },

    //Display After Insert
    function select(next) {
        const q = 'SELECT * FROM catalog.baseball_players';

        client.execute(q, function(err, res){
            if(err) return next(err);

            console.log('Data: ');
            for(let row of res) {
                console.log(row.first_name, ' ', row.last_name);
            }
            next();
        });
    },

    //Delete inserted row
    function del(next) {
        console.log('Removing Aaron Judge');

        const q = 'DELETE FROM baseball_players WHERE last_name = ? and first_name = ?';
        const params = ['Judge', 'Aaron'];

        client.execute(q, params, next);
    },

    //Display after delete
    function select(next) {
        const q = 'SELECT * FROM catalog.baseball_players';

        client.execute(q, function(err, res){
            if(err) return next(err);

            console.log('Data: ');
            for(let row of res) {
                console.log(row.first_name, ' ', row.last_name);
            }
            next();
        });
    },
], function(err) {
    if(err) {
        console.error('There was an error', err.message, err.stack);
    }

    //close the connection
    console.log('closing connection');
    client.shutdown(() => {
        if(err) {
            throw err;
        }
    });
});