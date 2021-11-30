const stateNames = ['q0','q1','q2','q3','q4','q5','q6']; // user input

let table = { // user input
  'q0': {a: 'q1', b: 'q2'},
  'q1': {a: 'q3', b: 'q4'},
  'q2': {a: 'q3', b: 'q5'},
  'q3': {a: 'q3', b: 'q1'},
  'q4': {a: 'q4', b: 'q5'},
  'q5': {a: 'q5', b: 'q4'},
  'q6': {a: 'q2', b: 'q6'},
};

const startState = 'q0';    // user input
const accepting = ['q3', 'q4','q5'];    // user input
const non_accepting = ['q0','q1', 'q2', 'q6'];  // user input (can calulate khuud)
const alphabet = ['a', 'b'];    // user input

/* example 2
const stateNames = ['q0','q1','q2','q3','q4','q5']; // user input

let table = { // user input
  'q0': {0: 'q1', 1: 'q2'},
  'q1': {0: 'q3', 1: 'q5'},
  'q2': {0: 'q1', 1: 'q4'},
  'q3': {0: 'q3', 1: 'q5'},
  'q4': {0: 'q5', 1: 'q2'},
  'q5': {0: 'q4', 1: 'q1'},
};

const startState = 'q0';    // user input
const accepting = ['q5', 'q4'];    // user input
const non_accepting = ['q0','q1', 'q2', 'q3'];  // user input (can calulate khuud)
const alphabet = ['0', '1'];    // user input
*/

// variables for storing minimised dfa outputs
minTable = table;
var minStateNames = [];
var noOfMinimisedStates;
var minStartState;
var minAccepting = [];

var particitions = {
    "P0": [],
    "P1": [],
};

function isInSameGroup( x,  y) {
    for(var key in particitions) {
        if(particitions[key].findIndex(element => element == x)>=0 & particitions[key].findIndex(element => element == y)>=0) {
            // they make transitionin same group
            return true;
        }
    }
    return false;
}

function removeItemOnce(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }

function removeUnReachable(table) {
    var stack = [];
    var visited = [];

    stack.push(startState);
    
    while(stack.length){
        const x = stack[stack.length -1];
        visited.push(x);
        stack.pop();
         for(let i=0; i<alphabet.length; i++) {
             const already_visited = visited.findIndex(element => element == table[x][alphabet[i]]);
            if (already_visited >=0) {
                // already visited this node, continue
            } else {
                stack.push(table[x][alphabet[i]]);
            }
        }
    }
    
    for(let i=0; i<stateNames.length; i++) {
        unreachable = visited.findIndex(element => element == stateNames[i]);
        if (unreachable >=0) {
            // it is a reachable state, leave it.
        } else {
            // also update the accepting and non-accepting states here
            delete table[stateNames[i]];
            delete minTable[stateNames[i]];
            removeItemOnce(non_accepting, stateNames[i]);
            removeItemOnce(accepting, stateNames[i]);
        }
    }
}


function minimiseDFA(table) {
    removeUnReachable(table);

    particitions["P0"] = non_accepting;
    particitions["P1"] = accepting;
    
    // check this partition
    for(var key in particitions) {
        var canLiveTogether = [];
        var canNotLiveTogether = [];

        for(let i=0; i<particitions[key].length; i++) {
            for(let j=i+1; j<particitions[key].length; j++) {
                for(let k=0; k<alphabet.length; k++) {
                    var a = table[particitions[key][i]][alphabet[k]];
                    var b = table[particitions[key][j]][alphabet[k]];
                    if(a == b) {
                        // console.log(particitions[key][i] +" and "+ particitions[key][j] + " make the same transition for " + alphabet[k] + "\n");
                        var arr = [particitions[key][i],particitions[key][j]];
                        if (k == alphabet.length -1) {
                            canLiveTogether.push(particitions[key][i]);
                            canLiveTogether.push(particitions[key][j]);
                        }
                    } else if (isInSameGroup(a,b)) {
                        // console.log(particitions[key][i] +" and "+ particitions[key][j] + " make the transition in same group for " + alphabet[k] + "\n");
                        var arr = [particitions[key][i],particitions[key][j]];
                        if (k == alphabet.length -1) {
                            canLiveTogether.push(particitions[key][i]);
                            canLiveTogether.push(particitions[key][j]);
                        }
                    } else {
                        // if they are not going to the same state or in the same group, make a separate grp
                        var arr = [particitions[key][i],particitions[key][j]];
                        canNotLiveTogether.push(arr);
                        break;
                    }
                }
            }
        }
        
        if(!canLiveTogether.length) {
            for(let i=0; i<particitions[key].length -1; i++ ) {
                var len = Object.keys(particitions).length.toString();
                particitions["P"+len] = particitions[key].splice(0, 1);
            }
        } else {
            all = particitions[key];
            var len = Object.keys(particitions).length.toString();
            var diff = all.filter(x => !canLiveTogether.includes(x));

            if(diff.length){
                particitions["P"+len] = diff;
                particitions[key] = canLiveTogether;    
            } 
        }
    }
    
    console.log("Below is how we are dividing the states");
    console.log(particitions);
    noOfMinimisedStates = Object.keys(particitions).length.toString();
    makeMinimisedTransmitTable(table, particitions);
}

function makeMinimisedTransmitTable(table, particitions) {
    for(let key in particitions) {
        // if there are equivalent grps in this group/partition
        if(particitions[key].length>1) {
            // in the below section, we combine the equivqlent states in one, add transitions for the combined stages
            // check in any if the combined state is to be added in inital state or final state
            for(let j=0; j<alphabet.length; j++) {
                var a = "";
                for(let i=0; i<particitions[key].length; i++) {
                    if (!a.includes(table[particitions[key][i]][alphabet[j]])) {
                        a = a + table[particitions[key][i]][alphabet[j]];
                    }

                    if (Object.keys(minTable).includes(particitions[key].join(''))) {
                        minTable[particitions[key].join('')][[alphabet[j]]] = a;
                    } else {
                        minTable[particitions[key].join('')] = {[alphabet[j]]: a};
                    }
                    
                    if(accepting.includes(particitions[key][i])) {
                        minAccepting.push(particitions[key].join(''));
                    }
                    if(startState == particitions[key][i]) {
                        minStartState = particitions[key].join('');
                    }
                    minStateNames.push(particitions[key].join(''));
                }
            }
        } else {
            // this is non-equivalent state, we check if it is final ot initial state. 
            // we will handle transitions for this state later
            if(accepting.includes(particitions[key])) {
                minAccepting.push(particitions[key]);
            }
            if(startState == particitions[key]) {
                minStartState = particitions[key];
            }
            minStateNames.push(particitions[key]);
        }
    }

//    var xc = Object.keys(minTable);
//     console.log(xc);
//     for (let i=0; i<xc.length; i++) {
//         console.log(minTable[xc[i]])
//     }
    
    minAccepting = [...new Set(minAccepting)];
    minStartState = [...new Set(minStartState)];
    minStateNames = [...new Set(minStateNames)];

    dropAllUnwantedKeys(minTable);


    console.log("\n\nNo of states in minised DFA: " + noOfMinimisedStates);
    console.log("Accepting States of minised DFA: " + minAccepting);
    console.log("Start State of minised DFA: " + minStartState);
    console.log("Named of States of minised DFA: " + minStateNames + "\n");

    console.log("\nhere to change transitions to mergred states as they do not exist anymore");
    for(let i =0; i<minStateNames.length; i++) {
        // console.log("\n\nworking on " + minStateNames[i].toString());
        // if this state was present in intial table
        if (stateNames.includes(minStateNames[i].toString())) {
            // console.log("it a orignal node");
            // for each alphabet of this state
            for(let k=0; k<alphabet.length; k++) {
                // console.log(minTable[minStateNames[i].toString()][alphabet[k]]);
                // check if the transition in original table land on still existing states
                if (!minStateNames.includes(minTable[minStateNames[i].toString()][alphabet[k]])) {
                    // if not, match this state to the new combined state
                    for (let j =0; j<minStateNames.length; j++) {
                        // console.log("working on min state = " + minStateNames[j] + " and wrong trans " + minTable[minStateNames[i].toString()][alphabet[k]]);
                        if(minStateNames[j].includes(minTable[minStateNames[i].toString()][alphabet[k]])) {
                            minTable[minStateNames[i].toString()][alphabet[k]] = minStateNames[j];
                        }
                        // else {
                        //     console.log("Code sholf not reach here");
                        // }
                    }
                }
            }
        }
    }

    var xc = Object.keys(minTable);
    console.log(xc);
    for (let i=0; i<xc.length; i++) {
        console.log(minTable[xc[i]])
    }
    
}

function dropAllUnwantedKeys(minTable) {
    console.log("\nhere to delete all unwanteed keys from mintable");
    var x = Object.keys(minTable);
    for (let i=0; i<x.length; i++) {
        var y = 0;
        for (let j=0; j<minStateNames.length; j++) {
            // console.log(" working on key " + x[i] + " and state " + minStateNames[j]);
            if(x[i] == minStateNames[j]){
                // console.log("matched");
                y = 1;
                // matched, cool do nothing
                break;
            }
        }
        if(y == 0) {
            // console.log("deleting key " + x[i] + "from minTable");
            delete minTable[x[i]];
        }

    }
}

minimiseDFA(table);