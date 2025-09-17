-- SQL Script untuk membuat test notifications
-- Untuk testing dynamic badge system

-- Pastikan user ID 2 ada (ganti dengan user ID yang sesuai)
-- SELECT id, firstName, lastName FROM users WHERE id = 2;

-- Hapus notifikasi lama untuk testing bersih (opsional)
-- DELETE FROM notifications WHERE userId = 2;

-- Buat 5 test notifications dengan status unread
INSERT INTO notifications (userId, title, body, type, data, isRead, sentAt, createdAt, updatedAt) VALUES
(2, '🎉 Selamat Datang!', 'Terima kasih telah bergabung dengan aplikasi kami. Nikmati fitur-fitur menarik yang tersedia!', 'general', '{"test": true, "index": 1}', false, NOW(), NOW(), NOW()),
(2, '🛍️ Produk Baru Tersedia', 'Kami telah menambahkan ruang kerja baru dengan fasilitas premium. Cek sekarang!', 'new_product', '{"test": true, "index": 2}', false, NOW(), NOW(), NOW()),
(2, '💰 Promo Spesial', 'Dapatkan diskon 30% untuk pemesanan ruang kerja hari ini. Jangan sampai terlewat!', 'promo', '{"test": true, "index": 3}', false, NOW(), NOW(), NOW()),
(2, '📋 Update Pesanan', 'Pesanan Anda dengan ID PRAPL001 telah dikonfirmasi dan sedang diproses.', 'order_status', '{"test": true, "index": 4}', false, NOW(), NOW(), NOW()),
(2, '💳 Pembayaran Berhasil', 'Pembayaran Anda sebesar Rp 150.000 telah berhasil diproses. Terima kasih!', 'payment', '{"test": true, "index": 5}', false, NOW(), NOW(), NOW());

-- Verifikasi notifications yang dibuat
SELECT 
    id, 
    title, 
    type, 
    isRead, 
    sentAt,
    CASE 
        WHEN isRead = 0 THEN '🔔 Unread'
        ELSE '✅ Read'
    END as status
FROM notifications 
WHERE userId = 2 
ORDER BY sentAt DESC;

-- Hitung total unread notifications
SELECT COUNT(*) as unread_count 
FROM notifications 
WHERE userId = 2 AND isRead = false;

-- Query untuk testing badge behavior
-- Jalankan query ini setelah user membaca beberapa notifikasi

-- Reset semua notifications ke unread (untuk testing ulang)
-- UPDATE notifications SET isRead = false, readAt = NULL WHERE userId = 2;

-- Mark specific notification as read (simulate user reading)
-- UPDATE notifications SET isRead = true, readAt = NOW() WHERE id = [NOTIFICATION_ID];

-- Check unread count after marking some as read
-- SELECT COUNT(*) as unread_count FROM notifications WHERE userId = 2 AND isRead = false;
