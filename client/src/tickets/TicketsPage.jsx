import { useEffect, useState, useMemo } from 'react';
import QRCode from 'qrcode';
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clapperboard,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  FlaskConical,
  Home,
  Info,
  MapPin,
  Popcorn,
  QrCode,
  ReceiptText,
  Search,
  Ticket,
  UserRound,
  Wallet,
  ArrowRight
} from 'lucide-react';
import { readTicketHistory } from '../confirmation/confirmation.js';
import { ticketStatus, filterTickets, ticketQrPayload, ticketHref } from './tickets.js';
import './tickets.css';

const formatMoney = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

const formatDateTime = (val) => {
  if (!val || !Number.isFinite(Date.parse(val))) return 'Chưa có thông tin';
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(val));
};

export default function TicketsPage({ targetOrderCode }) {
  const [{ tickets, warning }] = useState(() => readTicketHistory());
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderCode, setSelectedOrderCode] = useState(() => {
    if (targetOrderCode) return targetOrderCode;
    const hash = window.location.hash || '';
    if (hash.startsWith('#chi-tiet-ve/')) {
      return decodeURIComponent(hash.replace('#chi-tiet-ve/', ''));
    }
    return tickets[0]?.orderCode || '';
  });

  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');
  const [posterError, setPosterError] = useState(false);

  // Sync selectedOrderCode when targetOrderCode prop or window hash changes
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash || '';
      if (hash.startsWith('#chi-tiet-ve/')) {
        const code = decodeURIComponent(hash.replace('#chi-tiet-ve/', ''));
        setSelectedOrderCode(code);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Filtered tickets in the history table
  const filteredTickets = useMemo(() => {
    return filterTickets(tickets, { tab: activeTab, query: searchQuery });
  }, [tickets, activeTab, searchQuery]);

  // The active ticket to display in the card & QR panel
  const currentTicket = useMemo(() => {
    return tickets.find((t) => t.orderCode === selectedOrderCode) || tickets[0] || null;
  }, [tickets, selectedOrderCode]);

  // Generate QR Code data URL whenever current ticket changes
  useEffect(() => {
    if (!currentTicket) {
      setQrDataUrl('');
      return;
    }
    let isMounted = true;
    try {
      const payload = ticketQrPayload(currentTicket);
      QRCode.toDataURL(payload, {
        width: 256,
        margin: 1,
        color: {
          dark: '#0B132B',
          light: '#FFFFFF'
        }
      })
        .then((url) => {
          if (isMounted) setQrDataUrl(url);
        })
        .catch((err) => {
          console.error('Lỗi sinh mã QR:', err);
          if (isMounted) setQrDataUrl('');
        });
    } catch (err) {
      console.error('Dữ liệu vé không hợp lệ để tạo QR:', err);
      if (isMounted) setQrDataUrl('');
    }
    return () => {
      isMounted = false;
    };
  }, [currentTicket]);

  const handleCopyCode = async (code, label = 'mã vé') => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyFeedback(`Đã sao chép ${label}!`);
      setTimeout(() => setCopyFeedback(''), 3000);
    } catch {
      setCopyFeedback('Không thể tự động sao chép.');
      setTimeout(() => setCopyFeedback(''), 3000);
    }
  };

  const booking = currentTicket?.booking;
  const status = currentTicket ? ticketStatus(currentTicket) : 'unknown';

  return (
    <div className="tickets-page">
      {/* Header */}
      <header className="tickets-header">
        <div className="tickets-shell tickets-header-inner">
          <a className="tickets-brand" href="#trang-chu">
            <span className="tickets-brand-symbol">
              <Clapperboard size={26} />
            </span>
            <span>
              NOVA CINEMA
              <small>LUXURY EXPERIENCE</small>
            </span>
          </a>

          <nav className="tickets-nav" aria-label="Điều hướng chính">
            <a href="#trang-chu">Trang chủ</a>
            <a href="#phim">Phim</a>
            <a href="#chon-combo">Bắp nước & Combo</a>
            <a href="#ve-cua-toi" className="active">
              Vé của tôi
            </a>
          </nav>

          <span className="tickets-badge-demo">
            <FlaskConical size={14} /> Bản mô phỏng
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="tickets-shell tickets-main">
        <div className="tickets-breadcrumb">
          <a href="#trang-chu">Trang chủ</a>
          <ChevronRight size={13} />
          <span>Vé của tôi</span>
          {currentTicket && (
            <>
              <ChevronRight size={13} />
              <span>{currentTicket.orderCode}</span>
            </>
          )}
        </div>

        <div className="tickets-title-row">
          <p className="tickets-eyebrow">NOVA CINEMA • MY TICKETS & HISTORY</p>
          <h1>
            Vé của tôi & <span>Mã QR</span>
          </h1>
          <p className="tickets-subtitle">
            Quản lý vé đã đặt, xem lại mã QR check-in và lịch sử đặt vé trong phiên trình duyệt.
          </p>
        </div>

        {warning && (
          <div className="confirmation-warning" role="alert" style={{ marginBottom: '1.5rem' }}>
            <Info size={18} /> <span>{warning}</span>
          </div>
        )}

        {/* Empty State */}
        {!tickets.length ? (
          <section className="tickets-empty-card">
            <Ticket size={48} />
            <h2>Bạn chưa có vé nào</h2>
            <p>
              Lịch sử đặt vé sẽ xuất hiện tại đây sau khi bạn hoàn tất một đơn đặt vé mô phỏng thành
              công trong phiên trình duyệt hiện tại.
            </p>
            <a className="tickets-btn-primary" href="#dat-ve">
              Đặt vé ngay <ArrowRight size={17} />
            </a>
          </section>
        ) : (
          <>
            {/* Top: Detail & QR Section */}
            {currentTicket && booking && (
              <div className="tickets-detail-grid">
                {/* Left Ticket Card */}
                <div className="ticket-card">
                  <div className="ticket-card-header">
                    <span>
                      <Ticket size={17} /> NOVA CINEMA • THẺ VÉ ĐIỆN TỬ
                    </span>
                    <span
                      className={`ticket-card-status ${status === 'upcoming' ? 'upcoming' : 'past'}`}
                    >
                      {status === 'upcoming' ? 'SẮP CHIẾU' : 'ĐÃ QUA'}
                    </span>
                  </div>

                  <div className="ticket-movie-strip">
                    <div className="ticket-poster-wrap">
                      {booking.poster && !posterError ? (
                        <img
                          src={booking.poster}
                          alt={`Poster ${booking.movieTitle || 'phim'}`}
                          onError={() => setPosterError(true)}
                        />
                      ) : (
                        <div className="ticket-poster-fallback">
                          <Clapperboard size={36} />
                        </div>
                      )}
                    </div>
                    <div className="ticket-movie-info">
                      <div className="ticket-pill-row">
                        {booking.ageRating && (
                          <span className="ticket-pill">{booking.ageRating}</span>
                        )}
                        {booking.format && <span className="ticket-pill">{booking.format}</span>}
                        {booking.language && (
                          <span className="ticket-pill">{booking.language}</span>
                        )}
                      </div>
                      <h2>{booking.movieTitle || 'Phim đã chọn'}</h2>
                      <p>Khách hàng: {currentTicket.contact?.name || 'Khách xem phim'}</p>
                    </div>
                  </div>

                  <div className="ticket-grid-specs">
                    <div className="ticket-spec-item">
                      <MapPin size={20} />
                      <div>
                        <small>Rạp chiếu</small>
                        <strong>{booking.cinemaName || 'Chưa có thông tin'}</strong>
                      </div>
                    </div>

                    <div className="ticket-spec-item">
                      <Clapperboard size={20} />
                      <div>
                        <small>Phòng chiếu</small>
                        <strong>{booking.roomName || 'Chưa có thông tin'}</strong>
                      </div>
                    </div>

                    <div className="ticket-spec-item">
                      <CalendarDays size={20} />
                      <div>
                        <small>Suất chiếu</small>
                        <strong>{formatDateTime(booking.startsAt)}</strong>
                      </div>
                    </div>

                    <div className="ticket-spec-item">
                      <Ticket size={20} />
                      <div>
                        <small>Ghế ngồi ({booking.seats.length} vé)</small>
                        <div className="ticket-seat-badges">
                          {booking.seats.map((seat, idx) => (
                            <b key={`${seat}-${idx}`}>{seat}</b>
                          ))}
                        </div>
                      </div>
                    </div>

                    {currentTicket.items && currentTicket.items.length > 0 && (
                      <div className="ticket-spec-item" style={{ gridColumn: 'span 2' }}>
                        <Popcorn size={20} />
                        <div>
                          <small>Bắp nước đi kèm</small>
                          <strong>
                            {currentTicket.items
                              .map((item) => `${item.quantity}× ${item.name}`)
                              .join(', ')}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ticket-card-foot">
                    <div className="ticket-order-meta">
                      <small>MÃ VÉ ĐIỆN TỬ</small>
                      <strong>{currentTicket.ticketCode}</strong>
                    </div>
                    <div className="ticket-price-total">
                      <small>TỔNG TIỀN MẪU</small>
                      <strong>{formatMoney(currentTicket.total)}</strong>
                    </div>
                  </div>
                </div>

                {/* Right QR Panel */}
                <div className="ticket-qr-panel">
                  <div className="ticket-qr-heading">
                    <h3>Mã QR Check-in</h3>
                    <p>Quét mã này tại rạp để vào phòng chiếu (Mô phỏng)</p>
                  </div>

                  <div className="ticket-qr-box">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt={`Mã QR vé ${currentTicket.ticketCode}`} />
                    ) : (
                      <QrCode size={90} color="#94a3b8" />
                    )}
                  </div>

                  <div className="ticket-qr-code-text">{currentTicket.ticketCode}</div>

                  {copyFeedback && <div className="ticket-qr-copy-feedback">{copyFeedback}</div>}

                  <button
                    type="button"
                    className="ticket-copy-btn"
                    onClick={() => handleCopyCode(currentTicket.ticketCode, 'mã vé')}
                  >
                    <Copy size={14} /> Sao chép mã vé
                  </button>

                  <p className="ticket-qr-notice">
                    <Info size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    Mã QR mô phỏng cho buổi thử nghiệm giao diện. Không có giá trị vào rạp thật và
                    không xuất file PDF.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom History Table */}
            <section className="tickets-history-section">
              <div className="tickets-history-head">
                <h2>
                  <ReceiptText size={22} color="#D4AF37" /> Lịch sử đặt vé
                  <span className="tickets-count-badge">{filteredTickets.length} vé</span>
                </h2>

                <div className="tickets-filter-toolbar">
                  {/* Tabs */}
                  <div className="tickets-tabs" role="tablist">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === 'all'}
                      className={`tickets-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                      onClick={() => setActiveTab('all')}
                    >
                      Tất cả ({tickets.length})
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === 'upcoming'}
                      className={`tickets-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                      onClick={() => setActiveTab('upcoming')}
                    >
                      Sắp chiếu
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === 'past'}
                      className={`tickets-tab-btn ${activeTab === 'past' ? 'active' : ''}`}
                      onClick={() => setActiveTab('past')}
                    >
                      Đã qua
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="tickets-search-wrap">
                    <Search size={15} />
                    <input
                      type="text"
                      className="tickets-search-input"
                      placeholder="Tìm phim, rạp, ghế, mã..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="tickets-table-wrap">
                <table className="tickets-table">
                  <thead>
                    <tr>
                      <th>Mã đơn / Mã vé</th>
                      <th>Phim</th>
                      <th>Rạp chiếu</th>
                      <th>Suất chiếu</th>
                      <th>Ghế</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((receipt) => {
                      const isSelected = receipt.orderCode === selectedOrderCode;
                      const st = ticketStatus(receipt);
                      return (
                        <tr
                          key={receipt.orderCode}
                          className={isSelected ? 'selected' : ''}
                          onClick={() => {
                            setSelectedOrderCode(receipt.orderCode);
                            window.location.hash = ticketHref(receipt);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <td className="ticket-cell-order">
                            <span>{receipt.orderCode}</span>
                          </td>
                          <td className="ticket-cell-movie">
                            <strong>{receipt.booking?.movieTitle}</strong>
                            <small>
                              {receipt.booking?.format} • {receipt.booking?.ageRating}
                            </small>
                          </td>
                          <td>{receipt.booking?.cinemaName}</td>
                          <td className="ticket-cell-time">
                            <strong>{formatDateTime(receipt.booking?.startsAt)}</strong>
                            <small>Giờ Việt Nam</small>
                          </td>
                          <td>
                            <div className="ticket-cell-seats">
                              {receipt.booking?.seats.map((s, idx) => (
                                <span key={`${s}-${idx}`}>{s}</span>
                              ))}
                            </div>
                          </td>
                          <td className="ticket-cell-price">{formatMoney(receipt.total)}</td>
                          <td>
                            <span
                              className={`ticket-card-status ${st === 'upcoming' ? 'upcoming' : 'past'}`}
                            >
                              {st === 'upcoming' ? 'Sắp chiếu' : 'Đã qua'}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="ticket-view-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrderCode(receipt.orderCode);
                                window.location.hash = ticketHref(receipt);
                                window.scrollTo({ top: 120, behavior: 'smooth' });
                              }}
                            >
                              <Eye size={13} /> {isSelected ? 'Đang xem' : 'Xem QR'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="tickets-footer">
        <div className="tickets-shell tickets-footer-inner">
          <a href="#trang-chu" className="tickets-brand">
            <Clapperboard size={22} color="#D4AF37" />
            <span>
              NOVA CINEMA<small>LUXURY EXPERIENCE</small>
            </span>
          </a>
          <small>ĐIỆN ẢNH • TRẢI NGHIỆM • CẢM XÚC</small>
        </div>
      </footer>
    </div>
  );
}
