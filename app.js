const STORAGE = "bookback_v1";

const seed = {
  settings: { overdueDays: 15, reminderDays: [2], maxPrebooks: 5, defaultDuration: 15, reminderEnabled: true },
  onboardingSeen: false,
  books: [
    {id:"b1", title:"Atomic Habits", author:"James Clear", genre:"Self-help", price:499, added:"2026-09-02", status:"borrowed", borrowerId:"f1", cover:"", notes:"", history:[]},
    {id:"b2", title:"The Alchemist", author:"Paulo Coelho", genre:"Fiction", price:399, added:"2026-08-20", status:"available", borrowerId:null, cover:"", notes:"", history:[]},
    {id:"b3", title:"Clean Code", author:"Robert C. Martin", genre:"Technology", price:650, added:"2026-08-12", status:"borrowed", borrowerId:"f2", cover:"", notes:"", history:[]},
    {id:"b4", title:"Ikigai", author:"Héctor García & Francesc Miralles", genre:"Self-help", price:299, added:"2026-07-28", status:"available", borrowerId:null, cover:"", notes:"", history:[]},
    {id:"b5", title:"Harry Potter and the Philosopher's Stone", author:"J.K. Rowling", genre:"Fantasy", price:499, added:"2026-07-10", status:"borrowed", borrowerId:"f3", cover:"", notes:"", history:[]},
    {id:"b6", title:"The Psychology of Money", author:"Morgan Housel", genre:"Finance", price:599, added:"2026-06-17", status:"available", borrowerId:null, cover:"", notes:"", history:[]},
    {id:"b7", title:"Python Crash Course", author:"Eric Matthes", genre:"Technology", price:720, added:"2026-06-03", status:"available", borrowerId:null, cover:"", notes:"", history:[]},
    {id:"b8", title:"The Midnight Library", author:"Matt Haig", genre:"Fiction", price:450, added:"2026-05-19", status:"available", borrowerId:null, cover:"", notes:"", history:[]},
  ],
  friends: [
    {id:"f1", name:"Mahi", email:"nidhi@example.com", avatar:"M", active:true},
    {id:"f2", name:"Rahul", email:"rahul@example.com", avatar:"R", active:true},
    {id:"f3", name:"Priya", email:"priya@example.com", avatar:"P", active:true},
    {id:"f4", name:"Aarav", email:"aarav@example.com", avatar:"A", active:true},
  ],
  loans: [
    {id:"l1", bookId:"b1", friendId:"f1", borrowedDate:"2026-09-18", duration:15, dueDate:"2026-10-03", returnedDate:null, status:"borrowed"},
    {id:"l2", bookId:"b3", friendId:"f2", borrowedDate:"2026-09-13", duration:15, dueDate:"2026-09-28", returnedDate:null, status:"borrowed"},
    {id:"l3", bookId:"b5", friendId:"f3", borrowedDate:"2026-09-25", duration:15, dueDate:"2026-10-10", returnedDate:null, status:"borrowed"},
  ],
  prebooks: [
    {id:"p1", bookId:"b5", friendId:"f4", created:"2026-09-27", position:1, status:"waiting"},
    {id:"p2", bookId:"b5", friendId:"f2", created:"2026-09-28", position:2, status:"waiting"}
  ],
  notifications: [
    {id:"n1", type:"due", message:"Atomic Habits is due in 2 days — borrower: Mahi.", created:"2026-10-01T09:10:00", read:false},
    {id:"n2", type:"prebook", message:"Aarav pre-booked Harry Potter.", created:"2026-09-30T15:00:00", read:false}
  ],
  history: [
    {id:"h1", bookId:"b8", friendId:"f1", borrowedDate:"2026-08-01", dueDate:"2026-08-16", returnedDate:"2026-08-14", duration:15, status:"returned"}
  ]
};

let db = load();
let currentPage = "home";

function load(){
  try{
    const x=localStorage.getItem(STORAGE);
    const data=x?JSON.parse(x):structuredClone(seed);
    // Keep existing demo data in sync with the updated friend name.
    const f1=data.friends?.find(f=>f.id==="f1");
    if(f1 && f1.name==="Nidhi"){ f1.name="Mahi"; f1.avatar="M"; }
    const n1=data.notifications?.find(n=>n.id==="n1");
    if(n1 && n1.type==="due" && n1.message.includes("Atomic Habits")){
      n1.message="Atomic Habits is due in 2 days — borrower: Mahi.";
    }
    return data;
  }catch(e){return structuredClone(seed)}
}
function save(){ localStorage.setItem(STORAGE, JSON.stringify(db)); }
function today(){ return new Date("2026-10-01T12:00:00"); }
function dateObj(s){ return new Date(s+"T12:00:00"); }
function daysBetween(a,b=today()){ return Math.max(0, Math.floor((b-dateObj(a))/86400000)); }
function money(n){ return "₹"+Number(n||0).toLocaleString("en-IN"); }
function friend(id){ return db.friends.find(f=>f.id===id); }
function book(id){ return db.books.find(b=>b.id===id); }
function loanForBook(id){ return db.loans.find(l=>l.bookId===id && !l.returnedDate); }
function activePrebooks(id){ return db.prebooks.filter(p=>p.bookId===id && p.status==="waiting").sort((a,b)=>a.position-b.position); }
function statusFor(b){
  const l=loanForBook(b.id);
  if(!l) return activePrebooks(b.id).length ? "reserved" : "available";
  if(dateObj(l.dueDate)<today()) return "overdue";
  if((dateObj(l.dueDate)-today())/86400000<=2) return "due";
  return "borrowed";
}
function statusTag(s){
  const map={available:["green","Available"],borrowed:["blue","Borrowed"],due:["yellow","Due Soon"],overdue:["red","Overdue"],reserved:["purple","Pre-booked"],returned:["gray","Returned"]};
  const x=map[s]||map.available; return `<span class="tag ${x[0]}">${x[1]}</span>`;
}
function coverHtml(b,big=false){
  const cls=big?"cover big":"cover";
  return b.cover ? `<img class="${cls}" src="${escapeAttr(b.cover)}" alt="">` : `<div class="${cls}">📖</div>`;
}
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escapeAttr(s=""){return escapeHtml(s)}

function render(){
  const titles={home:"Home",books:"My Books",add:"Add Book",outside:"Outside Books",friends:"Friends",prebookings:"Pre-bookings",notifications:"Notifications",buddy:"Book Buddy",history:"History",settings:"Settings"};
  document.getElementById("page-title").textContent=titles[currentPage];
  document.querySelectorAll("[data-page]").forEach(el=>el.classList.toggle("active",el.dataset.page===currentPage));
  const root=document.getElementById("page-root");
  root.innerHTML=pages[currentPage]();
  bindPage();
  updateNotificationBadge();
}
function navigate(p){ currentPage=p; render(); window.scrollTo({top:0,behavior:"smooth"}); }

function stats(){
  const outside=db.books.filter(b=>loanForBook(b.id));
  return {total:db.books.length,available:db.books.length-outside.length,outside:outside.length,value:outside.reduce((s,b)=>s+b.price,0),library:db.books.reduce((s,b)=>s+b.price,0),borrowers:new Set(outside.map(b=>loanForBook(b.id)?.friendId)).size,overdue:outside.filter(b=>statusFor(b)==="overdue").length};
}

const pages = {
home(){
 const s=stats(), outside=db.books.filter(b=>loanForBook(b.id)), recent=[...db.books].sort((a,b)=>b.added.localeCompare(a.added)).slice(0,4);
 const due=outside.filter(b=>["due","overdue"].includes(statusFor(b)));
 return `<div class="hero"><div><div class="eyebrow">Thursday · 1 October 2026</div><h1>Good morning, Nidhi 👋</h1><p>Your private library, lending ledger and friend book club — all in one place.</p></div><div class="hero-actions"><button class="btn btn-primary" onclick="navigate('add')">＋ Add Book</button><button class="btn" onclick="openLendModal()">↗ Lend Book</button></div></div>
 <div class="stat-grid">
 ${statCard("Total books",s.total,"in your library")}${statCard("Available",s.available,"ready to lend")}${statCard("Outside",s.outside,"with friends")}${statCard("Value outside",money(s.value),"informational value")}${statCard("Active borrowers",s.borrowers,"friends with books")}${statCard("Overdue",s.overdue,s.overdue?"needs attention":"all on track",s.overdue>0)}
 </div>
 <div class="grid-2">
  <section class="panel"><div class="panel-head"><div><div class="panel-title">⚠️ Needs attention</div><div class="panel-sub">Things worth checking today</div></div><button class="link-btn" onclick="navigate('notifications')">View all</button></div>
   <div class="attention-list">${due.length?due.map(b=>{const l=loanForBook(b.id),f=friend(l.friendId),days=daysBetween(l.borrowedDate);return `<div class="attention"><div class="mini-icon">📕</div><div><b>${escapeHtml(b.title)}</b><span>${escapeHtml(f.name)} · ${statusFor(b)==="overdue"?`overdue by ${days-daysBetween(borrowedDateSafe(l),today())} days`:`due ${prettyDate(l.dueDate)}`}</span></div></div>`}).join(""):`<div class="empty">✨ Nothing needs attention right now.</div>`}</div>
  </section>
  <section class="panel"><div class="panel-head"><div><div class="panel-title">📤 Currently outside</div><div class="panel-sub">${s.outside} books · ${money(s.value)}</div></div><button class="link-btn" onclick="navigate('outside')">View all</button></div>
   <div class="book-list">${outside.slice(0,4).map(outsideRow).join("")||`<div class="empty">No books are outside.</div>`}</div>
  </section>
 </div>
 <div class="grid-2" style="margin-top:16px">
  <section class="panel"><div class="panel-head"><div><div class="panel-title">🆕 Recently added</div><div class="panel-sub">Your newest shelf additions</div></div><button class="link-btn" onclick="navigate('books')">My Books</button></div><div class="cover-grid">${recent.map(bookCard).join("")}</div></section>
  <section class="panel"><div class="panel-head"><div><div class="panel-title">🤖 Ask Book Buddy</div><div class="panel-sub">Your library-aware assistant</div></div><button class="link-btn" onclick="navigate('buddy')">Open chat</button></div>
   <div class="notice"><strong>Try asking:</strong> “Who has Atomic Habits?”<br>“How many books are outside?”<br>“Is Harry Potter available?”</div>
   <button class="btn btn-primary" style="width:100%" onclick="navigate('buddy')">✦ Ask Book Buddy</button>
  </section>
 </div>`;
},
books(){
 return `<div class="hero"><div><div class="eyebrow">Your collection</div><h1>My Books</h1><p>One physical copy per title. Every status is kept in sync.</p></div><div class="hero-actions"><button class="btn btn-primary" onclick="navigate('add')">＋ Add Book</button></div></div>
 <div class="searchbar"><input id="book-search" class="input" placeholder="Search title, author or genre…"><select id="book-status" class="select"><option value="all">All statuses</option><option value="available">Available</option><option value="borrowed">Borrowed</option><option value="due">Due Soon</option><option value="overdue">Overdue</option><option value="reserved">Pre-booked</option></select><select id="book-sort" class="select"><option value="recent">Recently added</option><option value="title">Title A–Z</option><option value="price">Price high–low</option></select></div>
 <div id="book-grid" class="cover-grid">${db.books.map(bookCard).join("")}</div>`;
},
add(){
 return `<div class="hero"><div><div class="eyebrow">Expand your shelf</div><h1>Add a book</h1><p>Track the physical copy you own. Price is informational only — no payments.</p></div></div>
 <section class="panel form-card"><form id="add-book-form"><div class="form-grid">
  <div class="field"><label>Book title *</label><input class="input" name="title" required placeholder="e.g. Atomic Habits"></div>
  <div class="field"><label>Author *</label><input class="input" name="author" required placeholder="e.g. James Clear"></div>
  <div class="field"><label>Genre / category</label><input class="input" name="genre" placeholder="e.g. Self-help"></div>
  <div class="field"><label>Price / value (₹) *</label><input class="input" name="price" type="number" min="0" required placeholder="499"></div>
  <div class="field"><label>Date added</label><input class="input" name="added" type="date" value="2026-10-01"></div>
  <div class="field"><label>Cover image URL (optional)</label><input class="input" name="cover" placeholder="https://…"></div>
  <div class="field full"><label>Notes</label><textarea class="textarea" name="notes" rows="3" placeholder="Edition, condition, where you bought it…"></textarea></div>
 </div><div class="form-actions"><button type="button" class="btn" onclick="navigate('books')">Cancel</button><button class="btn btn-primary">Add to library</button></div></form></section>`;
},
outside(){
 const outside=db.books.filter(b=>loanForBook(b.id));
 return `<div class="hero"><div><div class="eyebrow">Lending ledger</div><h1>Books Outside</h1><p>Only books currently with friends appear here.</p></div><div class="hero-actions"><button class="btn" onclick="openLendModal()">↗ Lend a book</button></div></div>
 <div class="stat-grid">${statCard("Books outside",outside.length,"currently borrowed")}${statCard("Total value outside",money(outside.reduce((s,b)=>s+b.price,0)),"book value only")}${statCard("Overdue",outside.filter(b=>statusFor(b)==="overdue").length,"past due")}</div>
 <section class="panel"><div class="table-wrap"><table class="table"><thead><tr><th>Book</th><th>Person</th><th>Borrowed</th><th>Duration</th><th>Due</th><th>Value</th><th>Status</th><th></th></tr></thead><tbody>${outside.map(b=>{const l=loanForBook(b.id),f=friend(l.friendId);return `<tr><td><b>${escapeHtml(b.title)}</b><div class="muted">${escapeHtml(b.author)}</div></td><td>${escapeHtml(f.name)}</td><td>${prettyDate(l.borrowedDate)}</td><td>${l.duration} days</td><td>${prettyDate(l.dueDate)}</td><td>${money(b.price)}</td><td>${statusTag(statusFor(b))}</td><td><button class="btn" onclick="returnBook('${b.id}')">Mark returned</button></td></tr>`}).join("")||`<tr><td colspan="8"><div class="empty">Your shelf is fully home. ✨</div></td></tr>`}</tbody></table></div></section>`;
},
friends(){
 return `<div class="hero"><div><div class="eyebrow">Private sharing</div><h1>Friends</h1><p>Search who has what, see due dates, and manage private access.</p></div><div class="hero-actions"><button class="btn btn-primary" onclick="showInviteModal()">＋ Invite friend</button></div></div>
 <div class="searchbar"><input id="friend-search" class="input" placeholder="Search by friend name…"></div>
 <div id="friend-grid" class="friend-grid">${db.friends.map(friendCard).join("")}</div>`;
},
prebookings(){
 const rows=db.prebooks.filter(p=>p.status==="waiting");
 return `<div class="hero"><div><div class="eyebrow">Waiting lists</div><h1>Pre-bookings</h1><p>Each book can have up to ${db.settings.maxPrebooks} people waiting. No global limit.</p></div></div>
 <section class="panel"><div class="table-wrap"><table class="table"><thead><tr><th>Book</th><th>Friend</th><th>Position</th><th>Requested</th><th>Status</th></tr></thead><tbody>${rows.map(p=>{const b=book(p.bookId),f=friend(p.friendId);return `<tr><td><b>${escapeHtml(b.title)}</b><div class="muted">${activePrebooks(b.id).length}/${db.settings.maxPrebooks} waiting</div></td><td>${escapeHtml(f.name)}</td><td>#${p.position}</td><td>${prettyDate(p.created)}</td><td>${statusTag("reserved")}</td></tr>`}).join("")||`<tr><td colspan="5"><div class="empty">No one is waiting for a book.</div></td></tr>`}</tbody></table></div></section>`;
},
notifications(){
 return `<div class="hero"><div><div class="eyebrow">Stay in the loop</div><h1>Notifications</h1><p>Due dates, returns, requests and pre-booking updates.</p></div><div class="hero-actions"><button class="btn" onclick="markNotificationsRead()">Mark all read</button></div></div>
 <section class="panel"><div class="attention-list">${db.notifications.slice().sort((a,b)=>b.created.localeCompare(a.created)).map(n=>`<div class="attention" style="${n.read?'opacity:.55':''}"><div class="mini-icon">${n.type==="due"?"⏰":n.type==="prebook"?"🔖":"🔔"}</div><div><b>${escapeHtml(n.message)}</b><span>${new Date(n.created).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}${n.read?" · Read":""}</span></div></div>`).join("")||`<div class="empty">No notifications yet.</div>`}</div></section>`;
},
buddy(){
 return `<div class="hero"><div><div class="eyebrow">Library assistant</div><h1>Book Buddy ✦</h1><p>Ask questions about your real library data.</p></div></div>
 <section class="chat-shell"><div class="chat-messages" id="chat-messages"><div class="bubble bot">Hi Nidhi! 📚 I know your BookLendingTracker library. Ask me who has a book, what's overdue, what's available, or anything about your lending list.</div></div><div><div class="quick-prompts"><button class="quick" onclick="askBuddy('How many books are outside?')">How many outside?</button><button class="quick" onclick="askBuddy('Who has Atomic Habits?')">Who has Atomic Habits?</button><button class="quick" onclick="askBuddy('Which books are overdue?')">Overdue books</button><button class="quick" onclick="askBuddy('Is Harry Potter available?')">Is Harry Potter available?</button></div><div class="chat-input"><input id="buddy-input" class="input" placeholder="Ask me anything about your library…"><button class="btn btn-primary" onclick="sendBuddy()">Send</button></div></div></section>`;
},
history(){
 return `<div class="hero"><div><div class="eyebrow">Your lending record</div><h1>History</h1><p>Every completed loan stays here for reference.</p></div></div>
 <section class="panel"><div class="table-wrap"><table class="table"><thead><tr><th>Book</th><th>Borrower</th><th>Borrowed</th><th>Due</th><th>Returned</th><th>Duration</th><th>Status</th></tr></thead><tbody>${db.history.slice().reverse().map(h=>`<tr><td><b>${escapeHtml(book(h.bookId)?.title||"Unknown")}</b></td><td>${escapeHtml(friend(h.friendId)?.name||"Unknown")}</td><td>${prettyDate(h.borrowedDate)}</td><td>${prettyDate(h.dueDate)}</td><td>${prettyDate(h.returnedDate)}</td><td>${h.duration} days</td><td>${statusTag("returned")}</td></tr>`).join("")||`<tr><td colspan="7"><div class="empty">No completed loans yet.</div></td></tr>`}</tbody></table></div></section>`;
},
settings(){
 return `<div class="hero"><div><div class="eyebrow">Control the rules</div><h1>Settings</h1><p>Make BookLendingTracker behave the way your library works.</p></div></div>
 <div class="grid-2"><section class="panel"><div class="panel-head"><div class="panel-title">Library settings</div></div><div class="setting-list">
  <div class="setting-row"><div><b>Overdue warning</b><span>Highlight books after this many days.</span></div><select id="overdue-setting" class="select setting-control"><option value="15">15 days</option><option value="30">30 days</option><option value="custom">Custom</option></select></div>
  <div id="custom-overdue-row" class="setting-row hidden"><div><b>Custom overdue days</b><span>Any practical threshold you prefer.</span></div><input id="custom-overdue" class="input setting-control" type="number" min="1" max="365" value="${db.settings.overdueDays}"></div>
  <div class="setting-row"><div><b>Reminder timing</b><span>Show due-soon reminders inside the app.</span></div><select id="reminder-setting" class="select setting-control"><option value="2">2 days before</option><option value="1">1 day before</option><option value="both">1 + 2 days before</option></select></div>
  <div class="setting-row"><div><b>Max pre-bookings per book</b><span>Fixed at 5 for this prototype.</span></div><span class="tag purple">5 people</span></div>
  <div class="setting-row"><div><b>Private library</b><span>Friends-only access is enabled.</span></div><div class="switch on"></div></div>
 </div></section>
 <section class="panel"><div class="panel-head"><div class="panel-title">Profile & access</div></div><div class="setting-list">
  <div class="setting-row"><div><b>Owner</b><span>Nidhi · full control</span></div><span class="avatar">N</span></div>
  <div class="setting-row"><div><b>Friends with access</b><span>${db.friends.length} people can interact with your private library.</span></div><button class="btn" onclick="showInviteModal()">Manage</button></div>
  <div class="setting-row"><div><b>Onboarding</b><span>Show the first-time walkthrough again.</span></div><button class="btn" onclick="db.onboardingSeen=false;save();startOnboarding()">Replay</button></div>
 </div></section></div>`;
}
};

function statCard(label,value,sub,warn=false){return `<div class="stat ${warn?"warn":""}"><div class="stat-label">${label}</div><div class="stat-value">${value}</div><div class="stat-sub">${sub}</div></div>`}
function prettyDate(s){if(!s)return "—";return dateObj(s).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
function borrowedDateSafe(l){return l.borrowedDate}
function outsideRow(b){const l=loanForBook(b.id),f=friend(l.friendId);return `<div class="book-row"><div>${coverHtml(b)}</div><div class="book-meta"><div class="book-title">${escapeHtml(b.title)}</div><div class="book-author">${escapeHtml(f.name)} · ${daysBetween(l.borrowedDate)} days</div>${statusTag(statusFor(b))}</div><div class="row-right"><div class="price">${money(b.price)}</div><button class="btn" style="margin-top:7px" onclick="returnBook('${b.id}')">Return</button></div></div>`}
function bookCard(b){return `<div class="book-card" onclick="showBookModal('${b.id}')">${coverHtml(b)}<div class="book-title">${escapeHtml(b.title)}</div><div class="book-author">${escapeHtml(b.author)}</div>${statusTag(statusFor(b))}</div>`}
function friendCard(f){const bs=db.books.filter(b=>loanForBook(b.id)?.friendId===f.id), overdue=bs.filter(b=>statusFor(b)==="overdue").length;return `<div class="friend-card" onclick="showFriendModal('${f.id}')"><div class="friend-top"><div class="avatar">${escapeHtml(f.avatar)}</div><div><div class="friend-name">${escapeHtml(f.name)}</div><div class="friend-email">${escapeHtml(f.email)}</div></div></div><div class="friend-stats"><div class="friend-stat"><b>${bs.length}</b><span>borrowing</span></div><div class="friend-stat"><b>${overdue}</b><span>overdue</span></div><div class="friend-stat"><b>${bs.reduce((s,b)=>s+b.price,0)?money(bs.reduce((s,b)=>s+b.price,0)):"₹0"}</b><span>value</span></div></div></div>`}

function bindPage(){
 document.querySelectorAll("#side-nav [data-page],#mobile-nav [data-page],.top-actions [data-page]").forEach(el=>el.onclick=()=>navigate(el.dataset.page));
 if(currentPage==="books"){
  const search=document.getElementById("book-search"), status=document.getElementById("book-status"), sort=document.getElementById("book-sort");
  const update=()=>{let q=search.value.toLowerCase(), arr=db.books.filter(b=>(!q||`${b.title} ${b.author} ${b.genre}`.toLowerCase().includes(q))&&(status.value==="all"||statusFor(b)===status.value)); if(sort.value==="title")arr.sort((a,b)=>a.title.localeCompare(b.title)); if(sort.value==="price")arr.sort((a,b)=>b.price-a.price); if(sort.value==="recent")arr.sort((a,b)=>b.added.localeCompare(a.added)); document.getElementById("book-grid").innerHTML=arr.map(bookCard).join("")||`<div class="empty" style="grid-column:1/-1">No books match.</div>`};
  [search,status,sort].forEach(x=>x.oninput=update);
 }
 if(currentPage==="friends"){const x=document.getElementById("friend-search");x.oninput=()=>{const q=x.value.toLowerCase();document.getElementById("friend-grid").innerHTML=db.friends.filter(f=>f.name.toLowerCase().includes(q)).map(friendCard).join("")||`<div class="empty">No friend found.</div>`}}
 if(currentPage==="add"){document.getElementById("add-book-form").onsubmit=addBook}
 if(currentPage==="settings"){const sel=document.getElementById("overdue-setting"); sel.value=[15,30].includes(db.settings.overdueDays)?String(db.settings.overdueDays):"custom"; toggleCustom(); sel.onchange=()=>{toggleCustom(); if(sel.value!=="custom"){db.settings.overdueDays=+sel.value;save();render()}}; document.getElementById("custom-overdue")?.addEventListener("change",e=>{db.settings.overdueDays=Math.max(1,Math.min(365,+e.target.value||15));save();toast("Overdue rule updated")}); const rem=document.getElementById("reminder-setting");rem.value=db.settings.reminderDays.length===2?"both":String(db.settings.reminderDays[0]);rem.onchange=()=>{db.settings.reminderDays=rem.value==="both"?[1,2]:[+rem.value];save();toast("Reminder timing updated")}}
}
function toggleCustom(){const row=document.getElementById("custom-overdue-row"), sel=document.getElementById("overdue-setting"); if(row&&sel)row.classList.toggle("hidden",sel.value!=="custom")}

function addBook(e){e.preventDefault();const f=new FormData(e.target), title=f.get("title").trim(), author=f.get("author").trim();if(db.books.some(b=>b.title.toLowerCase()===title.toLowerCase()))return toast("You already have this book — one copy only.","bad");const b={id:"b"+Date.now(),title,author,genre:f.get("genre")||"General",price:+f.get("price")||0,added:f.get("added")||"2026-10-01",cover:f.get("cover")||"",notes:f.get("notes")||"",status:"available",borrowerId:null,history:[]};db.books.push(b);save();toast("Book added to your library","good");navigate("books")}

function openLendModal(bookId=null){
 const available=db.books.filter(b=>!loanForBook(b.id));
 showModal(`<div class="modal-head"><h3>Lend a book</h3><button class="close" onclick="closeModal()">×</button></div><form id="lend-form"><div class="form-grid">
 <div class="field full"><label>Book</label><select class="select" name="bookId" required>${available.map(b=>`<option value="${b.id}" ${b.id===bookId?"selected":""}>${escapeHtml(b.title)} · ${money(b.price)}</option>`).join("")}</select></div>
 <div class="field"><label>Friend</label><select class="select" name="friendId" required>${db.friends.map(f=>`<option value="${f.id}">${escapeHtml(f.name)}</option>`).join("")}</select></div>
 <div class="field"><label>Borrowing duration</label><select class="select" name="duration" id="lend-duration"><option value="15">15 days</option><option value="30">30 days</option><option value="custom">Custom (1–60)</option></select></div>
 <div class="field hidden" id="custom-duration-field"><label>Custom days</label><input class="input" name="customDuration" type="number" min="1" max="60" value="7"></div>
 <div class="field full"><label>Note</label><textarea class="textarea" name="note" rows="2" placeholder="Optional note…"></textarea></div>
 </div><div class="form-actions"><button type="button" class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary">Confirm lend</button></div></form></div>`);
 const d=document.getElementById("lend-duration"), c=document.getElementById("custom-duration-field"); d.onchange=()=>c.classList.toggle("hidden",d.value!=="custom"); document.getElementById("lend-form").onsubmit=confirmLend;
}
function confirmLend(e){e.preventDefault();const f=new FormData(e.target), duration=f.get("duration")==="custom"?+f.get("customDuration"):+f.get("duration");if(duration<1||duration>60)return toast("Custom duration must be 1–60 days.","bad");const b=book(f.get("bookId"));if(loanForBook(b.id))return toast("That book is already outside.","bad");const start=today(), due=new Date(start);due.setDate(due.getDate()+duration);const iso=due.toISOString().slice(0,10);const l={id:"l"+Date.now(),bookId:b.id,friendId:f.get("friendId"),borrowedDate:"2026-10-01",duration,dueDate:iso,returnedDate:null,status:"borrowed"};db.loans.push(l);b.status="borrowed";b.borrowerId=l.friendId;db.notifications.unshift({id:"n"+Date.now(),type:"loan",message:`${friend(l.friendId).name} borrowed ${b.title} for ${duration} days.`,created:new Date().toISOString(),read:false});save();closeModal();toast("Loan recorded — dashboard updated","good");render()}

function returnBook(bookId){const b=book(bookId),l=loanForBook(bookId);if(!l)return;showModal(`<div class="modal-head"><h3>Mark as returned?</h3><button class="close" onclick="closeModal()">×</button></div><p style="font-size:12px;color:var(--muted)">Confirm that <b>${escapeHtml(b.title)}</b> has come back from ${escapeHtml(friend(l.friendId).name)}. The book will move to Available and the outside totals will update.</p><div class="form-actions"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="confirmReturn('${bookId}')">Mark as Returned</button></div>`)}
function confirmReturn(bookId){const b=book(bookId),l=loanForBook(bookId);l.returnedDate="2026-10-01";l.status="returned";b.borrowerId=null;b.status="available";db.history.push({...l,id:"h"+Date.now()});db.notifications.unshift({id:"n"+Date.now(),type:"return",message:`${b.title} was returned by ${friend(l.friendId).name}.`,created:new Date().toISOString(),read:false});advanceQueue(bookId);save();closeModal();toast("Returned — book is available again","good");render()}
function advanceQueue(bookId){const q=activePrebooks(bookId);if(!q.length)return;const first=q[0];first.status="ready";db.notifications.unshift({id:"n"+Date.now(),type:"prebook",message:`${book(bookId).title} is now available for ${friend(first.friendId).name}.`,created:new Date().toISOString(),read:false})}

function prebook(bookId, friendId="f1"){const q=activePrebooks(bookId);if(q.some(p=>p.friendId===friendId))return toast("You are already in this queue.","bad");if(q.length>=db.settings.maxPrebooks)return toast("Pre-booking limit reached (5 people).","bad");db.prebooks.push({id:"p"+Date.now(),bookId,friendId,created:"2026-10-01",position:q.length+1,status:"waiting"});save();closeModal();toast("Added to the pre-booking queue","good");render()}

function showBookModal(id){
 const b=book(id),l=loanForBook(id),q=activePrebooks(id);
 showModal(`<div class="modal-head"><h3>${escapeHtml(b.title)}</h3><button class="close" onclick="closeModal()">×</button></div><div style="display:flex;gap:18px">${coverHtml(b,true)}<div style="flex:1"><div class="eyebrow">${escapeHtml(b.genre)}</div><h2 style="font-family:'Playfair Display';margin:0 0 5px">${escapeHtml(b.title)}</h2><div class="muted">${escapeHtml(b.author)}</div><div style="margin:12px 0">${statusTag(statusFor(b))}</div><div class="notice"><strong>Book value: ${money(b.price)}</strong>This is informational only. BookLendingTracker never charges borrowers.</div>${l?`<div class="muted">Currently with <b>${escapeHtml(friend(l.friendId).name)}</b> · due ${prettyDate(l.dueDate)} · ${l.duration} days</div>`:`<div class="muted">Available to borrow now.</div>`}<div class="muted" style="margin-top:9px">${q.length} / ${db.settings.maxPrebooks} people waiting</div></div></div>
 <div class="form-actions">${l?`<button class="btn" onclick="closeModal();prebook('${b.id}')">🔖 Pre-book</button>`:`<button class="btn btn-primary" onclick="closeModal();openLendModal('${b.id}')">↗ Lend this book</button>`}</div>`);
}
function showFriendModal(id){
 const f=friend(id), bs=db.books.filter(b=>loanForBook(b.id)?.friendId===id), hist=db.history.filter(h=>h.friendId===id);
 showModal(`<div class="modal-head"><h3>${escapeHtml(f.name)}</h3><button class="close" onclick="closeModal()">×</button></div><div class="friend-top"><div class="avatar">${escapeHtml(f.avatar)}</div><div><div class="friend-name">${escapeHtml(f.name)}</div><div class="friend-email">${escapeHtml(f.email)}</div></div></div><div class="grid-3" style="margin-top:15px">${statCard("Borrowing",bs.length,"books")}${statCard("Overdue",bs.filter(b=>statusFor(b)==="overdue").length,"books")}${statCard("History",hist.length,"completed")}</div><h4 style="margin:20px 0 9px">Currently borrowing</h4><div class="book-list">${bs.map(outsideRow).join("")||`<div class="empty">No active loans.</div>`}</div>`);
}
function showInviteModal(){showModal(`<div class="modal-head"><h3>Invite a friend</h3><button class="close" onclick="closeModal()">×</button></div><p class="muted">Friends can access the books you permit, request available books and join pre-booking queues.</p><form id="invite-form"><div class="field"><label>Friend name</label><input class="input" name="name" required placeholder="e.g. Meera"></div><div class="field" style="margin-top:10px"><label>Email</label><input class="input" name="email" type="email" required placeholder="meera@example.com"></div><div class="form-actions"><button type="button" class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary">Create access</button></div></form>`);document.getElementById("invite-form").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),name=f.get("name");db.friends.push({id:"f"+Date.now(),name,email:f.get("email"),avatar:name[0].toUpperCase(),active:true});save();closeModal();toast(`${name} can now be invited to your private library`,"good");render()}}

function showModal(inner){document.getElementById("modal-root").innerHTML=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><div class="modal">${inner}</div></div>`}
function closeModal(){document.getElementById("modal-root").innerHTML=""}
function toast(msg,type=""){const el=document.createElement("div");el.className="toast "+type;el.textContent=msg;document.getElementById("toast-root").appendChild(el);setTimeout(()=>el.remove(),2600)}
function updateNotificationBadge(){const n=db.notifications.filter(x=>!x.read).length;document.getElementById("nav-notification-count").textContent=n;document.getElementById("nav-notification-count").classList.toggle("hidden",!n);document.getElementById("top-notification-dot").classList.toggle("hidden",!n)}
function markNotificationsRead(){db.notifications.forEach(n=>n.read=true);save();render();toast("Notifications marked as read")}

function sendBuddy(){const x=document.getElementById("buddy-input");if(x.value.trim())askBuddy(x.value.trim());}
function askBuddy(q){
 const messages=document.getElementById("chat-messages"); if(!messages)return;
 messages.innerHTML+=`<div class="bubble user">${escapeHtml(q)}</div>`;
 const a=buddyAnswer(q);messages.innerHTML+=`<div class="bubble bot">${a}</div>`;messages.scrollTop=messages.scrollHeight;
}
function buddyAnswer(q){
 const s=stats(), low=q.toLowerCase();
 if(low.includes("how many")&&low.includes("outside"))return `You currently have <b>${s.outside} books outside</b>, worth <b>${money(s.value)}</b> in informational book value.`;
 if(low.includes("overdue")){const x=db.books.filter(b=>statusFor(b)==="overdue");return x.length?`You have <b>${x.length} overdue book${x.length>1?"s":""}</b>: ${x.map(b=>escapeHtml(b.title)).join(", ")}.`:"Good news — <b>nothing is overdue</b> right now."}
 const who=matchBookQuery(q);if(who){const l=loanForBook(who.id);if(l)return `<b>${escapeHtml(who.title)}</b> is with <b>${escapeHtml(friend(l.friendId).name)}</b> and is due on <b>${prettyDate(l.dueDate)}</b>.`;return `<b>${escapeHtml(who.title)}</b> is <b>available</b> right now.`}
 if(low.includes("available")){const x=db.books.filter(b=>statusFor(b)==="available");return `You have <b>${x.length} available books</b>: ${x.slice(0,6).map(b=>escapeHtml(b.title)).join(", ")}${x.length>6?"…":""}`}
 if(low.includes("who has")){const f=db.friends.find(f=>low.includes(f.name.toLowerCase()));if(f){const x=db.books.filter(b=>loanForBook(b.id)?.friendId===f.id);return x.length?`${escapeHtml(f.name)} currently has: <b>${x.map(b=>escapeHtml(b.title)).join(", ")}</b>.`:`${escapeHtml(f.name)} doesn't currently have any of your books.`}}
 if(low.includes("value")||low.includes("price"))return `The complete library is worth <b>${money(s.library)}</b> on paper. Currently outside: <b>${money(s.value)}</b>. This app never collects money.`;
 if(low.includes("pre-book")||low.includes("queue")){const x=db.prebooks.filter(p=>p.status==="waiting");return x.length?`There are <b>${x.length} active pre-booking entries</b> across ${new Set(x.map(p=>p.bookId)).size} book${new Set(x.map(p=>p.bookId)).size>1?"s":""}. Each book can have up to 5 people waiting.`:"There are no active pre-bookings."}
 return `I can help with your library. Try asking:<br>• Who has Atomic Habits?<br>• Which books are overdue?<br>• How many books are outside?<br>• Is Harry Potter available?<br>• What's the total value outside?`;
}
function matchBookQuery(q){const low=q.toLowerCase();return db.books.find(b=>low.includes(b.title.toLowerCase()))||db.books.find(b=>{const words=b.title.toLowerCase().split(/\s+/).filter(w=>w.length>4);return words.some(w=>low.includes(w))})}

function startOnboarding(){
 let step=0; const items=[
  ["Welcome to your private library 📚","BookLendingTracker keeps your books, loans, returns, friends and waiting lists in one calm place."],
  ["Add your books","Add the books you already own. Each title represents one physical copy, so a book can only be lent once at a time."],
  ["Invite your friends","Friends can request available books and pre-book unavailable ones. Each book has a maximum queue of 5."],
  ["Never forget a book","Choose a 15-day, 30-day or custom overdue rule. Book Buddy can surface due-soon reminders inside the app."],
  ["Meet Book Buddy ✦","Ask who has a book, what's overdue, how much value is outside, or who is next in a pre-booking queue."]
 ];
 const renderStep=()=>{document.getElementById("onboarding-content").innerHTML=`<div class="eyebrow">Step ${step+1} of ${items.length}</div><h2>${items[step][0]}</h2><p>${items[step][1]}</p>`;document.getElementById("onboarding-dots").innerHTML=items.map((_,i)=>`<i class="${i===step?"active":""}"></i>`).join("");document.getElementById("next-onboarding").textContent=step===items.length-1?"Get Started":"Next";};
 document.getElementById("onboarding").classList.remove("hidden");renderStep();
 document.getElementById("next-onboarding").onclick=()=>{if(step<items.length-1){step++;renderStep()}else{db.onboardingSeen=true;save();document.getElementById("onboarding").classList.add("hidden");toast("Welcome to BookLendingTracker ✦","good")}};
 document.getElementById("skip-onboarding").onclick=()=>{db.onboardingSeen=true;save();document.getElementById("onboarding").classList.add("hidden")};
}

document.getElementById("mobile-menu").onclick=()=>document.querySelector(".sidebar").classList.toggle("mobile-open");
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
render();
if(!db.onboardingSeen) setTimeout(startOnboarding,450);
