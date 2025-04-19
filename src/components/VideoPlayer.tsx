import React, { useEffect, useRef, useState } from 'react';
import * as WebTorrent from 'webtorrent';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  torrentUrl: string;
  onClose: () => void;
  fallbackTorrents?: string[];
}

type WebTorrentInstance = InstanceType<typeof WebTorrent.default>;

const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ]
};

const DEFAULT_TRACKERS = [
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.btorrent.xyz',
  'wss://tracker.files.fm:7073/announce',
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://open.tracker.cl:1337/announce',
  'udp://tracker.openbittorrent.com:6969/announce',
  'udp://open.stealth.si:80/announce',
  'udp://exodus.desync.com:6969/announce',
  'wss://tracker.webtorrent.dev',
  'wss://spacetradersapi-chatbox.herokuapp.com:443/announce',
  'wss://qot.abiir.top:443/announce',
  'wss://tracker.files.fm:7073/announce'
];

const addCorsProxy = (url: string): string => {
  if (url.startsWith('magnet:')) return url;
  return `https://cors-anywhere.herokuapp.com/${url}`;
};

export function VideoPlayer({ torrentUrl, onClose, fallbackTorrents = [] }: VideoPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTorrentIndex, setCurrentTorrentIndex] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const clientRef = useRef<WebTorrentInstance | null>(null);

  const allTorrents = [torrentUrl, ...fallbackTorrents];

  const addTrackersToMagnet = (magnetUrl: string): string => {
    const url = new URL(magnetUrl);
    DEFAULT_TRACKERS.forEach(tracker => {
      url.searchParams.append('tr', tracker);
    });
    return url.toString();
  };

  const initializeTorrent = async (torrentUrl: string) => {
    if (clientRef.current) {
      clientRef.current.destroy();
    }

    setLoading(true);
    setError(null);
    setDownloadProgress(0);
    setCurrentUrl(torrentUrl);

    try {
      const client = new WebTorrent.default({
        webRTC: {
          config: STUN_SERVERS
        }
      });
      clientRef.current = client;

      // Updated URL handling logic
      const enhancedTorrentUrl = torrentUrl.startsWith('magnet:') 
        ? addTrackersToMagnet(torrentUrl)
        : (torrentUrl.startsWith('http') ? addCorsProxy(torrentUrl) : torrentUrl);

      console.log('Initializing torrent with URL:', enhancedTorrentUrl);

      client.add(enhancedTorrentUrl, {
        announce: DEFAULT_TRACKERS,
        maxWebConns: 20,
        strategy: 'rarest'
      }, (torrent) => {
        console.log('Torrent added:', torrent.infoHash);
        console.log('Connected to', torrent.numPeers, 'peers');

        const file = torrent.files.find(file =>
          /\.(mp4|mkv|avi|webm)$/i.test(file.name)
        );

        if (!file) {
          setError('No compatible video file found in torrent');
          setLoading(false);
          return;
        }

        torrent.on('download', () => {
          const progress = (torrent.progress * 100);
          setDownloadProgress(progress);
        });

        torrent.on('ready', () => {
          console.log('Torrent ready for playback');
        });

        torrent.on('warning', (warn) => {
          console.warn('Torrent warning:', warn);
        });

        torrent.on('error', (err) => {
          console.error('Torrent error:', err);
          handleTorrentError(err);
        });

        // @ts-ignore
        file.renderTo(videoRef.current, (err) => {
          if (err) {
            console.error('Render error:', err);
            handleTorrentError(err);
          } else {
            setLoading(false);
          }
        });
      });

      client.on('error', (err) => {
        console.error("WebTorrent client error:", err);
        handleTorrentError(err);
      });

    } catch (err) {
      console.error("Initialization error:", err);
      handleTorrentError(err);
    }
  };

  const handleTorrentError = (err: Error | string) => {
    const errorMessage = typeof err === 'string' ? err : err.message;
    setError(`Error loading torrent (${currentUrl}): ${errorMessage}`);
    setLoading(false);

    if (currentTorrentIndex < allTorrents.length - 1) {
      console.log('Trying next torrent...');
      setCurrentTorrentIndex(prev => prev + 1);
      setRetryCount(prev => prev + 1);
    }
  };

  const handleRetry = () => {
    if (currentTorrentIndex >= allTorrents.length - 1) {
      setCurrentTorrentIndex(0);
    }
    setRetryCount(prev => prev + 1);
    initializeTorrent(allTorrents[currentTorrentIndex]);
  };

  useEffect(() => {
    initializeTorrent(allTorrents[currentTorrentIndex]);

    return () => {
      if (clientRef.current) {
        clientRef.current.destroy((err) => {
          if (err) {
            console.error("Error destroying WebTorrent client:", err);
          }
        });
        clientRef.current = null;
      }
    };
  }, [currentTorrentIndex]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-full max-w-4xl">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-red-500 z-10 p-2"
        >
          Close
        </button>

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <Loader2 className="h-12 w-12 animate-spin text-red-600" />
            <p className="mt-4">Connecting to stream...</p>
            {downloadProgress > 0 && (
              <div className="w-64 mt-4">
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-red-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(downloadProgress, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Loading: {downloadProgress.toFixed(1)}%
                </p>
              </div>
            )}
            {retryCount > 0 && (
              <p className="mt-2 text-sm text-gray-400">
                Attempt {retryCount + 1} of {allTorrents.length}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
            <div className="text-center p-6 bg-white rounded-lg shadow-xl max-w-md">
              <AlertCircle className="mx-auto mb-4 text-red-500 h-12 w-12" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="flex justify-center gap-3">
                <button 
                  onClick={handleRetry}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  disabled={loading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                <button 
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full rounded-lg shadow-lg"
          controls
          autoPlay
          style={{ visibility: loading || error ? 'hidden' : 'visible' }}
        />
      </div>
    </div>
  );
}