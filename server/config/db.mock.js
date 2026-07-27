const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(__dirname, '..', 'database.json');

// Helper to read database
function readData() {
  if (!fs.existsSync(dbPath)) {
    // Seed data
    const initialData = {
      users: [
        { id: 1, nama: 'John Customer', email: 'customer@kroombox.com', password: 'password123', role: 'member', koin_reward: 850, foto: '', status_kerja: 'online', two_factor: 0, two_factor_secret: null, reset_otp: null, reset_otp_expires: null },
        { id: 2, nama: 'Sarah Staff', email: 'staff@kroombox.com', password: 'password123', role: 'staff', koin_reward: 0, foto: '', status_kerja: 'online', two_factor: 0, two_factor_secret: null, reset_otp: null, reset_otp_expires: null },
        { id: 3, nama: 'Alex Admin', email: 'admin@kroombox.com', password: 'password123', role: 'admin', koin_reward: 0, foto: '', status_kerja: 'online', two_factor: 0, two_factor_secret: null, reset_otp: null, reset_otp_expires: null },
        { id: 4, nama: 'Budi Santoso', email: 'budi@gmail.com', password: 'password123', role: 'member', koin_reward: 300, foto: '', status_kerja: 'online', two_factor: 0, two_factor_secret: null, reset_otp: null, reset_otp_expires: null },
        { id: 5, nama: 'Siti Aminah', email: 'siti@outlook.com', password: 'password123', role: 'member', koin_reward: 150, foto: '', status_kerja: 'online', two_factor: 0, two_factor_secret: null, reset_otp: null, reset_otp_expires: null },
        { id: 6, nama: 'Andi Wijaya', email: 'andi@yahoo.com', password: 'password123', role: 'member', koin_reward: 50, foto: '', status_kerja: 'online', two_factor: 0, two_factor_secret: null, reset_otp: null, reset_otp_expires: null }
      ],
      tickets: [
        { id: 1001, user_id: 1, staff_id: 2, judul: 'Hosting Error 500 on Main Domain', deskripsi: 'My website is showing a 500 internal server error since this morning.', status: 'diproses', is_priority: 1, created_at: '2026-04-01T10:00:00.000Z' },
        { id: 1003, user_id: 1, staff_id: null, judul: 'SSL Certificate Not Renewing', deskripsi: 'Auto-renewal for my SSL certificate failed.', status: 'menunggu', is_priority: 0, created_at: '2026-04-05T09:15:00.000Z' },
        { id: 1005, user_id: 5, staff_id: 2, judul: 'Refund Kebijakan Pembatalan Layanan', deskripsi: 'Apakah saya bisa mendapatkan refund jika baru berlangganan 1 hari?', status: 'selesai', is_priority: 0, created_at: '2026-03-25T11:00:00.000Z' }
      ],
      ticket_replies: [
        { id: 1, ticket_id: 1001, user_id: 1, konten: 'Website saya error 500, tolong bantu.', created_at: '2026-04-01T10:00:00.000Z' },
        { id: 2, ticket_id: 1001, user_id: 2, konten: 'Halo John, kami sedang mengecek log server Anda. Mohon tunggu sebentar.', created_at: '2026-04-01T10:15:00.000Z' }
      ],
      forums: [
        { id: 2001, user_id: 1, judul: 'Cara Optimasi Speed WordPress', konten: 'Ada yang tahu plugin terbaik buat optimasi speed WordPress?', created_at: '2026-03-28T14:30:00.000Z' },
        { id: 2004, user_id: 4, judul: 'Diskusi: Framework PHP terbaik 2026', konten: 'Menurut kalian mending Laravel atau Symfony buat project gede?', created_at: '2026-03-20T08:00:00.000Z' },
        { id: 2006, user_id: 6, judul: 'Rekomendasi Hosting Murah untuk Landing Page', konten: 'Lagi nyari hosting yang pas buat promo jualan, ada saran?', created_at: '2026-03-27T15:00:00.000Z' }
      ],
      forum_replies: [
        { id: 1, forum_id: 2001, user_id: 4, konten: 'Pake WP Rocket sama Cloudflare bro, mantap tuh.', created_at: '2026-03-29T09:00:00.000Z' },
        { id: 2, forum_id: 2001, user_id: 6, konten: 'Setuju sama Budi, tambahin LiteSpeed Cache kalo servernya support.', created_at: '2026-03-29T10:30:00.000Z' }
      ],
      point_histories: [
        { id: 1, user_id: 1, jenis_transaksi: 'masuk', jumlah_poin: 50, keterangan: 'Lapor Bug UI (Visual Glitch)', created_at: '2026-04-28T12:00:00.000Z' },
        { id: 2, user_id: 1, jenis_transaksi: 'masuk', jumlah_poin: 10, keterangan: 'Feedback Forum (Saran Fitur)', created_at: '2026-04-25T12:00:00.000Z' },
        { id: 3, user_id: 1, jenis_transaksi: 'masuk', jumlah_poin: 500, keterangan: 'Monthly Subscription Bonus', created_at: '2026-04-01T12:00:00.000Z' },
        { id: 4, user_id: 1, jenis_transaksi: 'keluar', jumlah_poin: 200, keterangan: 'Redeemed 10% Discount Voucher', created_at: '2026-03-15T12:00:00.000Z' },
        { id: 5, user_id: 4, jenis_transaksi: 'masuk', jumlah_poin: 100, keterangan: 'Daily Check-in', created_at: '2026-05-01T12:00:00.000Z' },
        { id: 6, user_id: 4, jenis_transaksi: 'keluar', jumlah_poin: 50, keterangan: 'Avatar Customize', created_at: '2026-05-02T12:00:00.000Z' }
      ]
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf8');
    return initialData;
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

// Helper to write database
function writeData(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

// Database query router simulating SQL execution on raw JSON data
async function query(sql, params = []) {
  const data = readData();
  const cleanSql = sql.replace(/\s+/g, ' ').trim();
  const lowerSql = cleanSql.toLowerCase();

  // --- USERS QUERIES ---

  // 1. SELECT * FROM users WHERE email = ?
  if (lowerSql.startsWith('select * from users where email =')) {
    const email = params[0];
    const rows = data.users.filter(u => u.email === email);
    return [rows, null];
  }

  // 2. SELECT id, nama, email, role, koin_reward, foto, status_kerja, two_factor FROM users WHERE id = ?
  if (lowerSql.startsWith('select id, nama, email, role, koin_reward, foto, status_kerja, two_factor from users where id =')) {
    const id = Number(params[0]);
    const rows = data.users.filter(u => u.id === id).map(u => ({
      id: u.id,
      nama: u.nama,
      email: u.email,
      role: u.role,
      koin_reward: u.koin_reward,
      foto: u.foto,
      status_kerja: u.status_kerja,
      two_factor: u.two_factor
    }));
    return [rows, null];
  }

  // 3. UPDATE users SET nama = ?, email = ?, foto = ?, status_kerja = ? WHERE id = ?
  if (lowerSql.startsWith('update users set nama =') && lowerSql.includes('status_kerja =') && lowerSql.includes('where id =')) {
    const [nama, email, foto, status_kerja, id] = params;
    const idNum = Number(id);
    const user = data.users.find(u => u.id === idNum);
    if (user) {
      user.nama = nama;
      user.email = email;
      user.foto = foto;
      user.status_kerja = status_kerja;
      writeData(data);
      return [{ affectedRows: 1 }, null];
    }
    return [{ affectedRows: 0 }, null];
  }

  // 4. SELECT password FROM users WHERE id = ?
  if (lowerSql.startsWith('select password from users where id =')) {
    const id = Number(params[0]);
    const user = data.users.find(u => u.id === id);
    const rows = user ? [{ password: user.password }] : [];
    return [rows, null];
  }

  // 5. UPDATE users SET password = ? WHERE id = ?
  if (lowerSql.startsWith('update users set password = ? where id =')) {
    const [password, id] = params;
    const idNum = Number(id);
    const user = data.users.find(u => u.id === idNum);
    if (user) {
      user.password = password;
      writeData(data);
      return [{ affectedRows: 1 }, null];
    }
    return [{ affectedRows: 0 }, null];
  }

  // 6. SELECT email FROM users WHERE id = ?
  if (lowerSql.startsWith('select email from users where id =')) {
    const id = Number(params[0]);
    const user = data.users.find(u => u.id === id);
    const rows = user ? [{ email: user.email }] : [];
    return [rows, null];
  }

  // 7. UPDATE users SET two_factor = 1, two_factor_secret = ? WHERE id = ?
  if (lowerSql.startsWith('update users set two_factor = 1, two_factor_secret = ? where id =')) {
    const [secret, id] = params;
    const idNum = Number(id);
    const user = data.users.find(u => u.id === idNum);
    if (user) {
      user.two_factor = 1;
      user.two_factor_secret = secret;
      writeData(data);
      return [{ affectedRows: 1 }, null];
    }
    return [{ affectedRows: 0 }, null];
  }

  // 8. UPDATE users SET two_factor = 0, two_factor_secret = NULL WHERE id = ?
  if (lowerSql.startsWith('update users set two_factor = 0, two_factor_secret = null where id =')) {
    const id = Number(params[0]);
    const user = data.users.find(u => u.id === id);
    if (user) {
      user.two_factor = 0;
      user.two_factor_secret = null;
      writeData(data);
      return [{ affectedRows: 1 }, null];
    }
    return [{ affectedRows: 0 }, null];
  }

  // 9. SELECT * FROM users WHERE id = ?
  if (lowerSql.startsWith('select * from users where id =')) {
    const id = Number(params[0]);
    const rows = data.users.filter(u => u.id === id);
    return [rows, null];
  }

  // 9b. SELECT nama, role FROM users WHERE id = ?
  if (lowerSql.startsWith('select nama, role from users where id =')) {
    const id = Number(params[0]);
    const user = data.users.find(u => u.id === id);
    const rows = user ? [{ nama: user.nama, role: user.role }] : [];
    return [rows, null];
  }

  // 10. SELECT id, nama FROM users WHERE email = ?
  if (lowerSql.startsWith('select id, nama from users where email =')) {
    const email = params[0];
    const rows = data.users.filter(u => u.email === email).map(u => ({ id: u.id, nama: u.nama }));
    return [rows, null];
  }

  // 11. UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE email = ?
  if (lowerSql.startsWith('update users set reset_otp =') && lowerSql.includes('where email =')) {
    const [otp, expires, email] = params;
    const user = data.users.find(u => u.email === email);
    if (user) {
      user.reset_otp = otp;
      user.reset_otp_expires = expires;
      writeData(data);
      return [{ affectedRows: 1 }, null];
    }
    return [{ affectedRows: 0 }, null];
  }

  // 12. SELECT reset_otp, reset_otp_expires FROM users WHERE email = ?
  if (lowerSql.startsWith('select reset_otp, reset_otp_expires from users where email =')) {
    const email = params[0];
    const user = data.users.find(u => u.email === email);
    const rows = user ? [{ reset_otp: user.reset_otp, reset_otp_expires: user.reset_otp_expires }] : [];
    return [rows, null];
  }

  // 13. UPDATE users SET password = ?, reset_otp = NULL, reset_otp_expires = NULL WHERE email = ?
  if (lowerSql.startsWith('update users set password = ?, reset_otp = null, reset_otp_expires = null where email =')) {
    const [password, email] = params;
    const user = data.users.find(u => u.email === email);
    if (user) {
      user.password = password;
      user.reset_otp = null;
      user.reset_otp_expires = null;
      writeData(data);
      return [{ affectedRows: 1 }, null];
    }
    return [{ affectedRows: 0 }, null];
  }

  // 14. SELECT COUNT(*) AS total FROM users
  if (lowerSql.startsWith('select count(*) as total from users')) {
    return [[{ total: data.users.length }], null];
  }

  // 15. SELECT id FROM users WHERE email = ?
  if (lowerSql.startsWith('select id from users where email =')) {
    const email = params[0];
    const rows = data.users.filter(u => u.email === email).map(u => ({ id: u.id }));
    return [rows, null];
  }

  // 16. INSERT INTO users (nama, email, password, role, koin_reward) VALUES (?, ?, ?, ?, ?)
  if (lowerSql.startsWith('insert into users')) {
    const [nama, email, password, role, koin_reward] = params;
    const newId = data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id: newId,
      nama,
      email,
      password,
      role,
      koin_reward: Number(koin_reward) || 0,
      foto: '',
      status_kerja: 'online',
      two_factor: 0,
      two_factor_secret: null,
      reset_otp: null,
      reset_otp_expires: null
    };
    data.users.push(newUser);
    writeData(data);
    return [{ insertId: newId }, null];
  }

  // 17. DELETE FROM users WHERE id = ?
  if (lowerSql.startsWith('delete from users where id =')) {
    const id = Number(params[0]);
    const initialLen = data.users.length;
    data.users = data.users.filter(u => u.id !== id);
    writeData(data);
    const affectedRows = initialLen - data.users.length;
    return [{ affectedRows }, null];
  }

  // 18. SELECT id, nama, email, role, koin_reward, foto FROM users ORDER BY role ASC, nama ASC
  if (lowerSql.startsWith('select id, nama, email, role, koin_reward, foto from users order by')) {
    const sorted = [...data.users].sort((a, b) => {
      const r = a.role.localeCompare(b.role);
      if (r !== 0) return r;
      return a.nama.localeCompare(b.nama);
    });
    return [sorted, null];
  }

  // 19. UPDATE users SET koin_reward = koin_reward + 50 WHERE id = ?
  if (lowerSql.startsWith('update users set koin_reward = koin_reward + 50 where id =')) {
    const id = Number(params[0]);
    const user = data.users.find(u => u.id === id);
    if (user) {
      user.koin_reward = (user.koin_reward || 0) + 50;
      writeData(data);
      return [{ affectedRows: 1 }, null];
    }
    return [{ affectedRows: 0 }, null];
  }

  // 20. UPDATE users SET koin_reward = koin_reward - ? WHERE id = ?
  if (lowerSql.startsWith('update users set koin_reward = koin_reward - ? where id =')) {
    const [points, id] = params;
    const idNum = Number(id);
    const user = data.users.find(u => u.id === idNum);
    if (user) {
      user.koin_reward = (user.koin_reward || 0) - Number(points);
      writeData(data);
      return [{ affectedRows: 1 }, null];
    }
    return [{ affectedRows: 0 }, null];
  }

  // 21. SELECT koin_reward FROM users WHERE id = ?
  if (lowerSql.startsWith('select koin_reward from users where id =')) {
    const id = Number(params[0]);
    const user = data.users.find(u => u.id === id);
    const rows = user ? [{ koin_reward: user.koin_reward }] : [];
    return [rows, null];
  }

  // --- TICKETS QUERIES ---

  // 1. INSERT INTO tickets (user_id, judul, deskripsi) VALUES (?, ?, ?)
  if (lowerSql.startsWith('insert into tickets')) {
    const [user_id, judul, deskripsi] = params;
    const newId = data.tickets.length > 0 ? Math.max(...data.tickets.map(t => t.id)) + 1 : 1001;
    const newTicket = {
      id: newId,
      user_id: Number(user_id),
      staff_id: null,
      judul,
      deskripsi,
      status: 'menunggu',
      is_priority: 0,
      created_at: new Date().toISOString()
    };
    data.tickets.push(newTicket);
    writeData(data);
    return [{ insertId: newId }, null];
  }

  // 2 & 3. SELECT tickets with joins
  if (lowerSql.startsWith('select t.id, t.user_id, t.staff_id, t.judul, t.deskripsi, t.status, t.is_priority, t.created_at, u1.nama as nama_pengirim, u2.nama as nama_staf from tickets t left join users u1 on t.user_id = u1.id left join users u2 on t.staff_id = u2.id')) {
    let rows = data.tickets.map(t => {
      const u1 = data.users.find(u => u.id === t.user_id);
      const u2 = data.users.find(u => u.id === t.staff_id);
      return {
        id: t.id,
        user_id: t.user_id,
        staff_id: t.staff_id,
        judul: t.judul,
        deskripsi: t.deskripsi,
        status: t.status,
        is_priority: t.is_priority,
        created_at: t.created_at,
        nama_pengirim: u1 ? u1.nama : null,
        nama_staf: u2 ? u2.nama : null
      };
    });

    if (lowerSql.includes('where t.id = ?')) {
      const id = Number(params[0]);
      rows = rows.filter(r => r.id === id);
    } else if (lowerSql.includes('where t.user_id = ?')) {
      const user_id = Number(params[0]);
      rows = rows.filter(r => r.user_id === user_id);
    }

    // Sort by created_at desc
    rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return [rows, null];
  }

  // 4. UPDATE tickets SET is_priority = ? WHERE id = ?
  if (lowerSql.startsWith('update tickets set is_priority = ? where id =')) {
    const [is_priority, id] = params;
    const idNum = Number(id);
    const ticket = data.tickets.find(t => t.id === idNum);
    if (ticket) {
      ticket.is_priority = Number(is_priority);
      writeData(data);
      return [{ affectedRows: 1 }, null];
    }
    return [{ affectedRows: 0 }, null];
  }

  // 5. UPDATE tickets SET status = ? WHERE id = ?
  if (lowerSql.startsWith('update tickets set status = ? where id =')) {
    const [status, id] = params;
    const idNum = Number(id);
    const ticket = data.tickets.find(t => t.id === idNum);
    if (ticket) {
      ticket.status = status;
      writeData(data);
      return [{ affectedRows: 1 }, null];
    }
    return [{ affectedRows: 0 }, null];
  }

  // 6. SELECT user_id, judul FROM tickets WHERE id = ?
  if (lowerSql.startsWith('select user_id, judul from tickets where id =')) {
    const id = Number(params[0]);
    const ticket = data.tickets.find(t => t.id === id);
    const rows = ticket ? [{ user_id: ticket.user_id, judul: ticket.judul }] : [];
    return [rows, null];
  }

  // 7. SELECT COUNT(*) AS total FROM tickets WHERE status != 'selesai'
  if (lowerSql.startsWith("select count(*) as total from tickets where status != 'selesai'")) {
    const count = data.tickets.filter(t => t.status !== 'selesai').length;
    return [[{ total: count }], null];
  }

  // 8. SELECT COUNT(*) AS total, SUM(CASE WHEN status = "selesai" THEN 1 ELSE 0 END) AS resolved FROM tickets
  if (lowerSql.startsWith('select count(*) as total, sum(case when status = "selesai" then 1 else 0 end) as resolved from tickets')) {
    const total = data.tickets.length;
    const resolved = data.tickets.filter(t => t.status === 'selesai').length;
    return [[{ total, resolved }], null];
  }

  // --- TICKET REPLIES QUERIES ---

  // 1. SELECT tr.id, tr.ticket_id, tr.user_id, tr.konten, tr.created_at, u.nama AS userName, u.role AS userRole FROM ticket_replies tr JOIN users u ON tr.user_id = u.id WHERE tr.ticket_id = ? ORDER BY tr.created_at ASC
  if (lowerSql.startsWith('select tr.id, tr.ticket_id, tr.user_id, tr.konten, tr.created_at, u.nama as username, u.role as userrole from ticket_replies tr join users u on tr.user_id = u.id where tr.ticket_id =')) {
    const ticket_id = Number(params[0]);
    const rows = data.ticket_replies
      .filter(tr => tr.ticket_id === ticket_id)
      .map(tr => {
        const u = data.users.find(user => user.id === tr.user_id);
        return {
          id: tr.id,
          ticket_id: tr.ticket_id,
          user_id: tr.user_id,
          konten: tr.konten,
          created_at: tr.created_at,
          userName: u ? u.nama : 'Unknown',
          userRole: u ? u.role : 'member'
        };
      });
    rows.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return [rows, null];
  }

  // 2. INSERT INTO ticket_replies (ticket_id, user_id, konten) VALUES (?, ?, ?)
  if (lowerSql.startsWith('insert into ticket_replies')) {
    const [ticket_id, user_id, konten] = params;
    const newId = data.ticket_replies.length > 0 ? Math.max(...data.ticket_replies.map(tr => tr.id)) + 1 : 1;
    const newReply = {
      id: newId,
      ticket_id: Number(ticket_id),
      user_id: Number(user_id),
      konten,
      created_at: new Date().toISOString()
    };
    data.ticket_replies.push(newReply);
    writeData(data);
    return [{ insertId: newId }, null];
  }

  // --- FORUMS QUERIES ---

  // 1. Get All Forums
  if (lowerSql.startsWith('select f.id, f.user_id, f.judul, f.konten, f.created_at, u.nama as authorname, (select count(*) from forum_replies fr where fr.forum_id = f.id) as replycount from forums f join users u on f.user_id = u.id order by f.created_at desc')) {
    const rows = data.forums.map(f => {
      const u = data.users.find(user => user.id === f.user_id);
      const replyCount = data.forum_replies.filter(fr => fr.forum_id === f.id).length;
      return {
        id: f.id,
        user_id: f.user_id,
        judul: f.judul,
        konten: f.konten,
        created_at: f.created_at,
        authorName: u ? u.nama : 'Unknown',
        replyCount
      };
    });
    rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return [rows, null];
  }

  // 2. INSERT INTO forums (user_id, judul, konten) VALUES (?, ?, ?)
  if (lowerSql.startsWith('insert into forums')) {
    const [user_id, judul, konten] = params;
    const newId = data.forums.length > 0 ? Math.max(...data.forums.map(f => f.id)) + 1 : 2001;
    const newForum = {
      id: newId,
      user_id: Number(user_id),
      judul,
      konten,
      created_at: new Date().toISOString()
    };
    data.forums.push(newForum);
    writeData(data);
    return [{ insertId: newId }, null];
  }

  // 3. Get Forum Detail
  if (lowerSql.startsWith('select f.id, f.user_id, f.judul, f.konten, f.created_at, u.nama as authorname from forums f join users u on f.user_id = u.id where f.id =')) {
    const id = Number(params[0]);
    const f = data.forums.find(forum => forum.id === id);
    if (f) {
      const u = data.users.find(user => user.id === f.user_id);
      return [[{
        id: f.id,
        user_id: f.user_id,
        judul: f.judul,
        konten: f.konten,
        created_at: f.created_at,
        authorName: u ? u.nama : 'Unknown'
      }], null];
    }
    return [[], null];
  }

  // 4. DELETE FROM forum_replies WHERE forum_id = ?
  if (lowerSql.startsWith('delete from forum_replies where forum_id =')) {
    const forum_id = Number(params[0]);
    data.forum_replies = data.forum_replies.filter(fr => fr.forum_id !== forum_id);
    writeData(data);
    return [{ affectedRows: 1 }, null];
  }

  // 5. DELETE FROM forums WHERE id = ?
  if (lowerSql.startsWith('delete from forums where id =')) {
    const id = Number(params[0]);
    const initialLen = data.forums.length;
    data.forums = data.forums.filter(f => f.id !== id);
    writeData(data);
    return [{ affectedRows: initialLen - data.forums.length }, null];
  }

  // --- FORUM REPLIES QUERIES ---

  // 1. Get Forum Replies
  if (lowerSql.startsWith('select fr.id, fr.forum_id, fr.user_id, fr.konten, fr.created_at, u.nama as username, u.role as userrole from forum_replies fr join users u on fr.user_id = u.id where fr.forum_id =')) {
    const forum_id = Number(params[0]);
    const rows = data.forum_replies
      .filter(fr => fr.forum_id === forum_id)
      .map(fr => {
        const u = data.users.find(user => user.id === fr.user_id);
        return {
          id: fr.id,
          forum_id: fr.forum_id,
          user_id: fr.user_id,
          konten: fr.konten,
          created_at: fr.created_at,
          userName: u ? u.nama : 'Unknown',
          userRole: u ? u.role : 'member'
        };
      });
    rows.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return [rows, null];
  }

  // 2. INSERT INTO forum_replies (forum_id, user_id, konten) VALUES (?, ?, ?)
  if (lowerSql.startsWith('insert into forum_replies')) {
    const [forum_id, user_id, konten] = params;
    const newId = data.forum_replies.length > 0 ? Math.max(...data.forum_replies.map(fr => fr.id)) + 1 : 1;
    const newReply = {
      id: newId,
      forum_id: Number(forum_id),
      user_id: Number(user_id),
      konten,
      created_at: new Date().toISOString()
    };
    data.forum_replies.push(newReply);
    writeData(data);
    return [{ insertId: newId }, null];
  }

  // 3. DELETE FROM forum_replies WHERE id = ?
  if (lowerSql.startsWith('delete from forum_replies where id =')) {
    const id = Number(params[0]);
    const initialLen = data.forum_replies.length;
    data.forum_replies = data.forum_replies.filter(fr => fr.id !== id);
    writeData(data);
    return [{ affectedRows: initialLen - data.forum_replies.length }, null];
  }

  // --- POINT HISTORIES QUERIES ---

  // 1. SELECT * FROM point_histories WHERE user_id = ? ORDER BY created_at DESC
  if (lowerSql.startsWith('select * from point_histories where user_id =')) {
    const user_id = Number(params[0]);
    const rows = data.point_histories.filter(ph => ph.user_id === user_id);
    rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return [rows, null];
  }

  // 2. SELECT id FROM point_histories WHERE user_id = ? AND keterangan LIKE ?
  if (lowerSql.startsWith('select id from point_histories where user_id =') && lowerSql.includes('keterangan like')) {
    const [user_id, rawLike] = params;
    const user_id_num = Number(user_id);
    const regexStr = rawLike.replace(/%/g, '.*');
    const regex = new RegExp(regexStr, 'i');
    const rows = data.point_histories
      .filter(ph => ph.user_id === user_id_num && regex.test(ph.keterangan || ''))
      .map(ph => ({ id: ph.id }));
    return [rows, null];
  }

  // 3. SELECT ph.id, ph.jenis_transaksi, ph.jumlah_poin, ph.keterangan, ph.created_at, u.nama AS user_name FROM point_histories ph JOIN users u ON ph.user_id = u.id ORDER BY ph.created_at DESC LIMIT 5
  if (lowerSql.startsWith('select ph.id, ph.jenis_transaksi, ph.jumlah_poin, ph.keterangan, ph.created_at, u.nama as user_name from point_histories ph join users u on ph.user_id = u.id order by ph.created_at desc limit 5')) {
    const rows = data.point_histories.map(ph => {
      const u = data.users.find(user => user.id === ph.user_id);
      return {
        id: ph.id,
        jenis_transaksi: ph.jenis_transaksi,
        jumlah_poin: ph.jumlah_poin,
        keterangan: ph.keterangan,
        created_at: ph.created_at,
        user_name: u ? u.nama : 'Unknown'
      };
    });
    rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return [rows.slice(0, 5), null];
  }

  // 4. INSERT INTO point_histories (user_id, jenis_transaksi, jumlah_poin, keterangan) VALUES (?, ?, ?, ?)
  if (lowerSql.startsWith('insert into point_histories')) {
    const [user_id, jenis_transaksi, jumlah_poin, keterangan] = params;
    const newId = data.point_histories.length > 0 ? Math.max(...data.point_histories.map(ph => ph.id)) + 1 : 1;
    const newPH = {
      id: newId,
      user_id: Number(user_id),
      jenis_transaksi,
      jumlah_poin: Number(jumlah_poin),
      keterangan,
      created_at: new Date().toISOString()
    };
    data.point_histories.push(newPH);
    writeData(data);
    return [{ insertId: newId }, null];
  }

  // DELETE point_histories for user
  if (lowerSql.startsWith('delete from point_histories where user_id =')) {
    const user_id = Number(params[0]);
    data.point_histories = data.point_histories.filter(ph => ph.user_id !== user_id);
    writeData(data);
    return [{ affectedRows: 1 }, null];
  }

  // DELETE forums for user
  if (lowerSql.startsWith('delete from forums where user_id =')) {
    const user_id = Number(params[0]);
    data.forums = data.forums.filter(f => f.user_id !== user_id);
    writeData(data);
    return [{ affectedRows: 1 }, null];
  }

  // DELETE forum_replies for user
  if (lowerSql.startsWith('delete from forum_replies where user_id =')) {
    const user_id = Number(params[0]);
    data.forum_replies = data.forum_replies.filter(fr => fr.user_id !== user_id);
    writeData(data);
    return [{ affectedRows: 1 }, null];
  }

  // --- STATS / ADMIN COMPLEX QUERIES ---

  // 1. Staff Performance Recaps
  if (lowerSql.startsWith('select u.id, u.nama as name, count(t.id) as dealt, sum(case when t.status = \'selesai\' then 1 else 0 end) as done from users u left join tickets t on u.id = t.staff_id where u.role = \'staff\' group by u.id, u.nama')) {
    const staffUsers = data.users.filter(u => u.role === 'staff');
    const rows = staffUsers.map(staff => {
      const staffTickets = data.tickets.filter(t => t.staff_id === staff.id);
      const doneCount = staffTickets.filter(t => t.status === 'selesai').length;
      return {
        id: staff.id,
        name: staff.nama,
        dealt: staffTickets.length,
        done: doneCount
      };
    });
    return [rows, null];
  }

  // 2. Daily Stats
  if (lowerSql.startsWith("select date_format(created_at, '%w') as day_name, count(*) as total, sum(case when status = 'selesai' then 1 else 0 end) as resolved from tickets where created_at >= date_sub(now(), interval 7 day) group by date_format(created_at, '%w'), date(created_at) order by date(created_at) asc")) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentTickets = data.tickets.filter(t => new Date(t.created_at) >= sevenDaysAgo);

    const daysMap = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    recentTickets.forEach(t => {
      const d = new Date(t.created_at);
      const dayName = dayNames[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];
      const key = `${dayName}_${dateStr}`;
      if (!daysMap[key]) {
        daysMap[key] = { day_name: dayName, date: dateStr, total: 0, resolved: 0 };
      }
      daysMap[key].total++;
      if (t.status === 'selesai') {
        daysMap[key].resolved++;
      }
    });

    const rows = Object.values(daysMap).sort((a, b) => a.date.localeCompare(b.date));
    return [rows, null];
  }

  // 3. Weekly Stats
  if (lowerSql.startsWith("select week(created_at) as week_num, count(*) as total, sum(case when status = 'selesai' then 1 else 0 end) as resolved from tickets where created_at >= date_sub(now(), interval 30 day) group by week(created_at) order by week(created_at) asc limit 4")) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTickets = data.tickets.filter(t => new Date(t.created_at) >= thirtyDaysAgo);

    const weeksMap = {};
    recentTickets.forEach(t => {
      const d = new Date(t.created_at);
      const firstJan = new Date(d.getFullYear(), 0, 1);
      const numOfDays = Math.floor((d - firstJan) / (24 * 60 * 60 * 1000));
      const weekNum = Math.ceil((d.getDay() + 1 + numOfDays) / 7);

      if (!weeksMap[weekNum]) {
        weeksMap[weekNum] = { week_num: weekNum, total: 0, resolved: 0 };
      }
      weeksMap[weekNum].total++;
      if (t.status === 'selesai') {
        weeksMap[weekNum].resolved++;
      }
    });

    const rows = Object.values(weeksMap).sort((a, b) => a.week_num - b.week_num).slice(0, 4);
    return [rows, null];
  }

  // 4. Monthly Stats
  if (lowerSql.startsWith("select date_format(created_at, '%m') as month_name, count(*) as total, sum(case when status = 'selesai' then 1 else 0 end) as resolved from tickets where created_at >= date_sub(now(), interval 6 month) group by date_format(created_at, '%m'), month(created_at) order by month(created_at) asc limit 6")) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentTickets = data.tickets.filter(t => new Date(t.created_at) >= sixMonthsAgo);

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthsMap = {};

    recentTickets.forEach(t => {
      const d = new Date(t.created_at);
      const monthName = monthNames[d.getMonth()];
      const monthNum = d.getMonth();
      const year = d.getFullYear();
      const key = `${year}_${monthNum}`;

      if (!monthsMap[key]) {
        monthsMap[key] = { month_name: monthName, total: 0, resolved: 0, sortKey: d };
      }
      monthsMap[key].total++;
      if (t.status === 'selesai') {
        monthsMap[key].resolved++;
      }
    });

    const rows = Object.values(monthsMap).sort((a, b) => a.sortKey - b.sortKey).slice(0, 6);
    return [rows, null];
  }

  // CREATE TABLE IF NOT EXISTS newsletters
  if (lowerSql.startsWith('create table if not exists newsletters')) {
    return [[], null];
  }

  // INSERT INTO newsletters
  if (lowerSql.startsWith('insert into newsletters')) {
    const [email] = params;
    if (!data.newsletters) {
      data.newsletters = [];
    }
    const duplicate = data.newsletters.find(n => n.email === email);
    if (duplicate) {
      const err = new Error(`Duplicate entry '${email}' for key 'email'`);
      err.code = 'ER_DUP_ENTRY';
      err.errno = 1062;
      throw err;
    }
    const newId = data.newsletters.length > 0 ? Math.max(...data.newsletters.map(n => n.id)) + 1 : 1;
    data.newsletters.push({
      id: newId,
      email,
      created_at: new Date().toISOString()
    });
    writeData(data);
    return [{ insertId: newId }, null];
  }

  console.log('UNHANDLED MOCK QUERY:', sql, params);
  return [[], null];
}

const pool = {
  getConnection: async () => {
    return {
      release: () => {},
      query: (sql, params) => query(sql, params)
    };
  },
  query: (sql, params) => query(sql, params)
};

// Initial verification logic
console.log('Database Connected Successfully!');

module.exports = pool;
