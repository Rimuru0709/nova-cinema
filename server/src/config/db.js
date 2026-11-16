import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nova_cinema',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+07:00'
});

export const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Đã kết nối MySQL thành công tới database:', process.env.DB_NAME || 'nova_cinema');
        connection.release();
    } catch (error) {
        console.error('❌ Lỗi kết nối MySQL:', error.message);
    }
};

export default pool;
