// Online Javascript Editor for free
// Write, Edit and Run your Javascript code using JS Online Compiler
    
const stateNames = ['q0','q1','q2','q3','q4','q5','q6'];
var minStateNames = [];

let table = {
  'q0': {a: 'q1', b: 'q2'},
  'q1': {a: 'q3', b: 'q4'},
  'q2': {a: 'q3', b: 'q5'},
  'q3': {a: 'q3', b: 'q1'},
  'q4': {a: 'q4', b: 'q5'},
  'q5': {a: 'q5', b: 'q4'},
  'q6': {a: 'q2', b: 'q6'},
};
minTable = table;

var particitions = {
    "P0": [],
    "P1": [],
};

var noOfMinimisedStates;
var stack = [];
const startState = 'q0';
var minStartState;
const accepting = ['q3', 'q4','q5'];
var minAccepting = [];
const non_accepting = ['q0','q1', 'q2', 'q6'];
const alphabet = ['a', 'b'];

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
                        console.log(particitions[key][i] +" and "+ particitions[key][j] + " make the same transition for " + alphabet[k] + "\n");
                        var arr = [particitions[key][i],particitions[key][j]];
                        if (k == alphabet.length -1) {
                            canLiveTogether.push(particitions[key][i]);
                            canLiveTogether.push(particitions[key][j]);
                        }
                    } else if (isInSameGroup(a,b)) {
                        console.log(particitions[key][i] +" and "+ particitions[key][j] + " make the transition in same group for " + alphabet[k] + "\n");
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
    
    console.log(particitions);
    noOfMinimisedStates = Object.keys(particitions).length.toString();
    makeMinimisedTransmitTable(table, particitions);
}

function makeMinimisedTransmitTable(table, particitions) {

    for(let key in particitions) {
        if(particitions[key].length>1) {
            var a = "";
            for(let j=0; j<alphabet.length; j++) {
                for(let i=0; i<particitions[key].length; i++) {

                    console.log("\na = " + a);
                    a = a + table[particitions[key][i]][alphabet[j]];
                    minTable[particitions[key].join('')][alphabet[j]] = a;
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
            if(accepting.includes(particitions[key])) {
                minAccepting.push(particitions[key]);
            }
            if(startState == particitions[key]) {
                minStartState = particitions[key];
            }
            minStateNames.push(particitions[key]);
        }
    }

    minAccepting = [...new Set(minAccepting)];
    minStartState = [...new Set(minStartState)];
    minStateNames = [...new Set(minStateNames)];

    console.log("\nnoOfMinimisedStates " + noOfMinimisedStates);
    console.log("minAccepting " + minAccepting);
    console.log("minStartState " + minStartState);
    console.log("minStateNames " + minStateNames + "\n");


    // for(let i=0; i<minStateNames.length; i++) {
    //     // console.log("\n\nhere = " + minStateNames[i] + " stateNames " + stateNames);
    //     // console.log("b " + stateNames.includes(minStateNames[i].toString()))

    //     // if state of min dfa is there is normal dfa
    //     if (stateNames.includes(minStateNames[i].toString())) {
    //         // console.log("in");

    //         // for each ablphabet
    //         for(let k=0; k<alphabet.length; k++) {
    //             // check if the transition in original table match the ones
    //             for (let j=0; j<minStateNames.length; j++) {
    //                 console.log("k = ", minStateNames[k])
    //                 console.log("there is a transition for " + minStateNames[i] + alphabet[k] + " at " + minStateNames[j] + " == " + minStateNames[j].includes(table[minStateNames[i].toString()][alphabet[k]]))
    //                 console.log("minStateNames[j]" + minStateNames[j]);
                    
    //                 if (minStateNames[j].includes(table[minStateNames[i].toString()][alphabet[k]])) {
    //                     // console.log("minTable" + minTable)
    //                     var ab = alphabet[k]
    //                     var bc = minStateNames[j].toString();
    //                     minTable[minStateNames[i].toString()] = {aa:bc};
    //                     break;
    //                 }
    //             }
    //         }
    //     } else {
    //         // minTable[minStateNames[i].toString()] = "tb";
    //     }
    // }

    console.log(minTable['q0']);
    
}



console.log("dfsdft " + table['q0']['a']);
removeUnReachable(table);
minimiseDFA(table);