import { Hono } from 'hono'

type admin ={
  AdminId:number;
  Username:string;
  Password:string;
  Designation:string;


}

type posts = {
  PostId:number;
  Complaint:string;
  Name:string;
  Date:string;
  GoogleId:string;
  RoomNumber:string;
  Floor:number;
}

type Bindings={
  DB:D1Database;

}
const app = new Hono<{Bindings:Bindings}>()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

//Admin table posting
app.post('/admin',async(c)=>{
  try{
    const {Username,Password,Designation} = await c.req.json();
    const {success} = await c.env.DB.prepare('Insert into Admin (Username,Password,Designation) VALUES(?,?,?)').bind(Username,Password,Designation).run();
    if (success) {
      return c.json({ message: "Admin added successfully" });
    } else {
      return c.json({ message: "Admin not added" });
    }
  }
  
 catch (error:any){
  return c.json({ error: error.toString() });
 }
})

//login for admin

app.post('/admin/login', async (c) => {
  try {
    const { Username, Password } = await c.req.json();

    // Query the database to check if the admin exists with the given Username and Password
    const admin = await c.env.DB.prepare(
      'SELECT * FROM Admin WHERE Username = ? AND Password = ?'
    )
    .bind(Username, Password)
    .first();

    if (admin) {
      // If the admin is found, return a success message
      return c.json({ message: "Login successful", admin });
    } else {
      // If no matching admin is found, return an error message
      return c.json({ message: "Invalid Username or Password" });
    }
  } catch (error) {
    return c.json({ error: error?.toString() });
  }
});


//posting the complaints 

app.post('/complaints', async (c) => {
  try {
    const { GoogleId, Complaint, Name, RoomNumber, Floor } = await c.req.json();
    const currentTimestamp = new Date().toISOString();
    const UpdatedAt= null;
    const { success, error } = await c.env.DB.prepare(
      'INSERT INTO Posts (GoogleId, Complaint, Name, RoomNumber, Floor, CreatedAt,UpdatedAt) VALUES (?, ?, ?, ?, ?, ?,?)'
    )
    .bind(GoogleId, Complaint, Name, RoomNumber, Floor, currentTimestamp,UpdatedAt)
    .run();

    if (success) {
      return c.json({ message: 'Complaint added successfully' });
    } else {
      return c.json({ message: 'Complaint not added', error: error || 'Unknown error' });
    }
  } catch (error) {
    // Catching and returning the error to help diagnose the issue
    return c.json({ error: error?.toString() });
  }
});


export default app
