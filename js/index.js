const User_List = document.getElementById('user-list');
let USER_COUNT =0;

// 해당 서버에 데이터 가져와 처리
function Response_Api(){
  fetch('https://js-todo-list-9ca3a.df.r.appspot.com/api/users')
      .then((response) => response.json())
      .then((myJson)=> {
        for(let i=0;i<myJson.length;i++)
          Get_Users(myJson,i);
        Click_User();
        document.querySelector('.user-create-button').addEventListener('click',Make_User);
        document.querySelector('.user-delete-button').addEventListener('click',Delete_User);
      })
};

//해당 데이터 내용을 가진 name 추가
function Get_Users(data,i){
  const $user_list = document.getElementById('user-list');
  const button = `<button class="ripple" id=${++USER_COUNT}>${data[i].name}</button>`
  const appRender = () => {
    $user_list.innerHTML += button;
  }
  appRender();
}

// 클릭시 생성 혹은 삭제 핸들러 실행
function Make_User(){
  document.querySelector('.user-create-button').addEventListener('click',onUserCreateHandler)
}
function Delete_User(){
  document.querySelector('.user-delete-button').addEventListener('click',onUserDeleteHandler)
}

//추가한 이름을 브라우저 및 서버에 적용
const onUserCreateHandler = () => {
  const userName = prompt("추가하고 싶은 이름을 입력해주세요.");
  // User의 이름은 최소 2글자 이상체크
  let User_Enough_Length = userName.length>1 ? true : false;
  if(User_Enough_Length) {
    const button = document.createElement('button');
    button.innerText = userName;
    button.classList.add('ripple');
    button.setAttribute('id',++USER_COUNT);
    User_List.insertBefore(button, document.querySelector('user-create-button'));
    POST_USER(userName);

    //추가된 만큼 핸들러 다시 추가
    USER_COUNT++;
    Click_User();
  }
}

//삭제한 이름을 가진 데이터를 브라우저 및 서버에 적용
const onUserDeleteHandler = ()=>{
  const userName = prompt("삭제하고 싶은 이름을 입력해주세요.");
  document.querySelectorAll('#user-list > button').forEach(x=>{
    if(x.innerText === userName){
      if(x.classList.contains('user-create-button')==true || x.classList.contains('user-delete-button')==true){
        alert('삭제 불가능');
      }
      else if(x.classList.contains('active')==true){
        alert('활성화 삭제 불가능');
      }
      else {
        x.remove();
        GET_USER_ID_AND_DELETE(userName);
      }
    }
  })
}

//해당 이름을 가진 내용을 서버에 추가하기
function POST_USER(name){
  fetch('https://js-todo-list-9ca3a.df.r.appspot.com/api/users',{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      name : `${name}`
    })
  }).then((response)=>response.json())
      .then(()=>alert('정상작동')).catch(()=>('오류 발생'))
}

//해당 이름을 가진 데이터의 ID를 서버에서 가져온 후 DELETE_USER 함수 실행
function GET_USER_ID_AND_DELETE(name){
  let ID;
  fetch('https://js-todo-list-9ca3a.df.r.appspot.com/api/users')
      .then(response=>response.json())
      .then(data=>{
        data.map((value)=>{
          if(value.name === name)
            ID = value._id;
        })
        return ID;
      })
      .then((ID)=>{DELETE_USER(ID)});
}

//해당 ID와 같은 내용의 데이터를 삭제
function DELETE_USER(_id){
  fetch(`https://js-todo-list-9ca3a.df.r.appspot.com/api/users/${_id}`,{method:"DELETE"})
      .then(response=>response.json())
      .then(()=>{alert('서버 데이터 정상 삭제')})
      .catch(()=>{alert('오류 발생')});
}

// 생성된 태그마다의 클릭 핸들러 구현
function Click_User(){
  for(let i=1;i<=USER_COUNT;i++)
  {
    let id = document.getElementById(`${i}`);
    if(id!==null)       //id가 숫자로 제대로 존재한다면 실행 (숫자가 아니라면 실행X)
      id.addEventListener('click',(event)=>OnUserClickHandler(id.innerText,event));
  }
}

//해당 이름을 가진 데이터를 서버에서 TODOITEMS를 가져오기
function OnUserClickHandler(Name,event){
  //클릭한 버튼을 active 상태로 만들고 그전의 버튼을 active 상태 취소
  event.target.parentNode.querySelectorAll('#user-list > button').forEach(x=>x.classList.remove('active'));
  event.target.classList.add('active');
  GET_USER_ID_AND_TODOITEMS(Name)
}

//해당 이름을 가진 데이터의 ID를 서버에서 가져온 후 GET_TODOITEMS 함수 실행
function GET_USER_ID_AND_TODOITEMS(name){
  let ID;
  fetch('https://js-todo-list-9ca3a.df.r.appspot.com/api/users')
      .then(response=>response.json())
      .then(data=>{
        data.map((value)=>{
          if(value.name === name)
            ID = value._id;
        })
        return ID;
      })
      .then((ID)=>{GET_TODOITEMS(ID)});
}

// TODOITEMS 가져온 내용 출력
function GET_TODOITEMS(ID){
  Remove_localStorage();
  Remove_li_tag();
  fetch(`https://js-todo-list-9ca3a.df.r.appspot.com/api/users/${ID}/items`)
      .then(response=>response.json())
      .then(data=>data.map(val=>{
        init_Element(val.contents,'F','F')
      }));
}

// 존재하는 모든 localStorage 초기화
function Remove_localStorage(){
  const localStorage_length = localStorage.length;
  const key=[];
  for(let i=0;i<localStorage_length;i++)
  {
    key.push(localStorage.key(i));
  }
  key.map(x=>localStorage.removeItem(x));
}

//모든 li태그 초기화
function Remove_li_tag(){
  document.querySelector('.todo-count > strong').innerText = 0;
  count = 0 ;
  const todolist =  document.querySelectorAll('.todo-list > li')
  todolist.forEach(x=>x.remove());
}


//   유저 ID 가져온 후 TODOLIST 추가하기 함수 실행
function GET_USER_ID_AND_ADD_TODOLIST(name,content){
  let ID;
  fetch('https://js-todo-list-9ca3a.df.r.appspot.com/api/users')
      .then(response=>response.json())
      .then(data=>{
        data.map((value)=>{
          if(value.name === name)
            ID = value._id;
        })
        return ID;
      })
      .then((ID)=>{ADD_TODOLIST(ID,content)});
}

//서버에 TODOLIST 추가
function ADD_TODOLIST(ID,value){
  fetch(`https://js-todo-list-9ca3a.df.r.appspot.com/api/users/${ID}/items/`,
      {
        method:"POST",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({
          'contents':value})})
      .then(response=>response.json())
      .then(()=>alert('정상 작동'))
      .catch(()=>alert('오류 작동'))
}


// todoList step1 내용들
const new_todo = document.querySelector('.new-todo');
let count = 0 ;     //할 일 갯수 세는 용

// 기존 저장된 것들이 있으면 이를 불러오는 함수 진행
function Reload_localStorage(){
  for(let i=0;i<localStorage.length;i++)
  {
    let key = localStorage.key(i);
    let item = localStorage.getItem(key);
    init_Element(key,item,'F');
  }
}

new_todo.addEventListener("keyup", function(event) {
  if (event.key === 'Enter') {
    (/[\S]/gi.test(new_todo.value)==true && check_overlap(new_todo.value) == true) ? init_Element(new_todo.value,'F','T') : alert('공백 혹은 같은 이름의 할일을 입력했습니다.');
    //입력한 할일 추가시 할일 공백으로 만들기
    new_todo.value = '';
  }
});         // 내용을 입력하고 'Enter'를 누르면 comfirm이 나오고 맞다면 admin함수 실행

function on_All_Filter_Handler(){
  document.querySelectorAll('.todo-list > li').forEach(x => x.style.display = '');
  /* 아래코드도 가능
 let child = document.querySelector('.todo-list')
 child.childNodes.forEach(x=> x.style.display = '');
   */
}

function on_Active_Filter_Handler(){
  document.querySelectorAll('.todo-list > li').forEach(x => x.classList.contains('active') == true ? x.style.display = '' : x.style.display = 'none');
  /* 아래코드도 가능
  let child = document.querySelector('.todo-list')
  child.childNodes.forEach(x=>x.classList.contains('active') == true ? x.style.display='' : x.style.display = 'none');
  */
}

function on_Completed_Filter_Handler() {
  document.querySelectorAll('.todo-list > li').forEach(x => x.classList.contains('completed') == true ? x.style.display = '' : x.style.display = 'none')
  /* 아래코드도 가능
  let child = document.querySelector('.todo-list')
  child.childNodes.forEach(x=>x.classList.contains('completed') == true ?  x.style.display='' : x.style.display = 'none')
  */
}

function click_set() {
//전체보기 버튼 클릭시 모든 내용 display
  document.querySelector('.all').addEventListener('click', on_All_Filter_Handler);

//해야할 일 버튼 클릭시 class가 completed인 것들은 display가 none이 되도록
  document.querySelector('.active').addEventListener('click', on_Active_Filter_Handler);

//완료한 일 클릭시 class가 active인 것들은 display가 none이 되도록
  document.querySelector('.completed').addEventListener('click', on_Completed_Filter_Handler);
}

//기존 할일과 같은 이름의 중복 방지 함수
function check_overlap(value){
  for(let i=0;i<localStorage.length;i++)
  {
    if(value === localStorage.key(i))
      return false;
  }
  return true;
}

function init_Element(value,item,cause_of_add) {
  const $todo_list = document.querySelector('.todo-list');
  const content = (value)=>`
        <li class="active"> 
            <div class="view">
                <input class="toggle" type="checkbox">
                <label class="label">${value}</label>            
                <button class="destroy"></button>    
            </div>
        </li>
    `
  $todo_list.innerHTML += content(value);
  //localStorage의 value(item)이 T이면 completed한 상태 및 체크상태 유지(아닐경우 기본 active와 체크상태 X이다)
  if(item === 'T')
  {
    document.querySelectorAll('.label').forEach($el => {
      if($el.innerText === value){
        $el.closest('li').setAttribute('class' , 'completed');
        $el.closest('div').children[0].setAttribute('checked','true');
      }
    })
  }
  //  item이 F이면 active 상태로 처음 작성시 item == 'F' 일때의 localStorage 저장 역할
  else
    localStorage.setItem(value,'F');

  //버튼 클릭시 가장가까운 li태그 삭제 및, 해야할 count 값 줄이기
  document.querySelectorAll('.destroy').forEach($el => $el.addEventListener('click', function (event) {
    event.target.closest('li').remove();
    document.querySelector('.todo-count > strong').innerText = --count;
    localStorage.removeItem(event.target.closest('div').children[1].innerText);
  }))

  // 체크박스 클릭시 li태그에 class속성 추가 및 text에 중간작대기 생성 (클릭 취소하면 class속성 completed 추가 및 text원래대로)
  // 체크박스 클릭 혹은 클릭 취소 시  localStorage 속성도 변화시킨다.
  document.querySelectorAll('.toggle').forEach($el => $el.addEventListener('click', function (event) {
    if ($el.checked === true) {
      event.target.closest('li').setAttribute('class','completed');
      localStorage.setItem(event.target.closest('div').children[1].innerText,'T');
    } else {
      event.target.closest('li').setAttribute('class','active');
      localStorage.setItem(event.target.closest('div').children[1].innerText,'F');
    }
  }))

  //label 더블클릭시 작동
  document.querySelectorAll('.label').forEach($el => $el.addEventListener('dblclick',function(event){
    // 기존의 class인 li_class와 input태그인 input_tag 설정
    let li_class = event.target.closest('li').getAttribute('class');
    let input_tag  = document.createElement('input');

    event.target.closest('li').setAttribute('class','editing');
    input_tag.setAttribute('class','edit');
    event.target.closest('li').insertAdjacentElement("beforeend", input_tag);

    //input에서 Enter 클릭시 적용/ Esc 클릭시 취 소적용
    input_tag.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && /[\S]/gi.test(input_tag.value)==true && check_overlap(input_tag.value) == true) {
        //기존 localItem 제거, 새로운 localItem 추가 및 값 변경과 기본값으로 속성 변경 및 click_set 다시 설정(변화 후 바로 적용되게)
        localStorage.removeItem(event.target.closest('label').innerText);
        localStorage.setItem(input_tag.value,'F');
        event.target.closest('label').innerText = input_tag.value;
        input_tag.remove();
        event.target.closest('li').setAttribute('class', 'active');
        event.target.closest('div').children[0].removeAttribute('checked')
        click_set();
      }
      else if (e.key === 'Escape') {
        // li class가 editing에서 active로 다시 원래로 바꾸기 및 input_tag 제거
        input_tag.remove();
        event.target.closest('li').setAttribute('class', li_class);     //기존의 class로 바꾸기
      }
      else if(e.key === 'Enter' && /[\S]/gi.test(input_tag.value)==false){
        alert('공백 입력 금지')
      }
      else if(e.key === 'Enter' && check_overlap(input_tag.value) == false){
        alert('이미 존재하는 할일 입력 금지')
      }
    });
  }))
  //strong태그 안에 있는 count 값 적용시키기
  document.querySelector('.todo-count > strong').innerText = ++count;
  //해당 이벤트핸들러 및 모든 걸 끝낸 후 li태그를 가진 내용을 ul태그 안에 넣기

  if(cause_of_add === 'T') {
    GET_USER_ID_AND_ADD_TODOLIST(document.querySelector('#user-list > .active').innerHTML, value);
  }
}

//처음 시작시 이벤트 핸들러 적용
click_set();
Reload_localStorage();

//처음 시작시 이벤트 핸들러 적용
Response_Api();
