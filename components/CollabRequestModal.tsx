interface CollabRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  collabRequests: any[];
  onAccept: (req: any) => void;
  onReject: (req: any) => void;
}

export const CollabRequestsModal = ({
  isOpen,
  onClose,
  collabRequests,
  onAccept,
  onReject,
}: CollabRequestsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#181818] border border-white/10 w-full max-w-sm rounded-2xl p-5 flex flex-col gap-4 shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Undangan Kolaborasi
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xs font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
          {collabRequests && collabRequests.length > 0 ? (
            collabRequests.map((req: any) => (
              <div key={req.id} className="bg-white/5 p-3.5 rounded-xl border border-white/10 flex flex-col gap-2">
                <p className="text-xs text-gray-300 leading-relaxed">
                  <span className="font-bold text-purple-400">@{req.owner_username || req.sender}</span> mengundangmu kolaborasi di playlist <span className="font-bold text-white">"{req.name || req.playlistName}"</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button 
                    onClick={() => {
                      onAccept(req);
                      if (collabRequests.length <= 1) onClose();
                    }} 
                    className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Setujui
                  </button>
                  <button 
                    onClick={() => {
                      onReject(req);
                      if (collabRequests.length <= 1) onClose();
                    }} 
                    className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500 text-center py-6">Tidak ada undangan kolaborasi saat ini.</p>
          )}
        </div>
      </div>
    </div>
  );
};
