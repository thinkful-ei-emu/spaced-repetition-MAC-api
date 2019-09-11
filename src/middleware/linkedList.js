class _Node { 
  constructor(value, next){
    this.value = value; 
    this.next = next;
  }
}

class LinkedList {
  constructor(){
    this.head = null;
  }

  insertFirst(item){
    this.head = new _Node(item, this.head);
  }

  insertLast(item){
    if(this.head === null){
      this.insertFirst(item);
    }
    else {
      //starts with the first node
      let tempNode = this.head;
      while(tempNode.next !== null){
        tempNode = tempNode.next;
      }
      tempNode.next = new _Node(item, null);
    }
  }

  insertBefore(item, beforeNode){
    if(this.head === null){
      this.insertFirst(item);
    }
    if(beforeNode === this.head){
      this.insertFirst(item);
    }
    let currNode = this.head;
    let prevNode = this.head;
  
    let targetNode = this.find(beforeNode);
    while(currNode !== targetNode){
      prevNode = currNode;
      currNode = currNode.next;
    }
    prevNode.next = new _Node(item, targetNode);
  }

  insertAfter(item, afterNode){
    if(this.head === null){
      this.insertFirst(item);
    }
    let currNode = this.head;
    let targetNode = this.find(afterNode);

    while(currNode !== targetNode){
      currNode = currNode.next;
    }
    currNode.next = new _Node(item, targetNode.next);
  }

  insertAt(item, location){
    if(this.head === null){
      this.insertFirst(item);
    }
    if(location === 0){
      this.insertFirst(item);
    }
    let currNode = this.head;
    let prevNode = this.head;
    for(let i=0; i<location; i++){
      prevNode = currNode;
      currNode = currNode.next;
    }
    prevNode.next = new _Node(item, currNode);
  }  

  find(item){
    console.log('ITEM',item)
    let currNode = this.head;
    console.log("HEAD CURRENT NODE",currNode)

    if(!this.head){

      return null; 
    }
    while(currNode.value.translation !== item){
      if(currNode.next === null){
        return null;
      }
      else{
        console.log("CURRENT NODE",currNode)

        currNode = currNode.next;
      }
    }
    return currNode;
  }
}

module.exports = LinkedList;
