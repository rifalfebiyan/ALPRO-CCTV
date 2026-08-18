-- ALPRO CCTV Dashboard Schema Configuration

-- 1. Stores Table
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  region VARCHAR(100) NOT NULL,
  address TEXT,
  contact_person VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Online', -- Online, Warning, Offline
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. NVRs / DVRs Table (Network Video Recorders)
CREATE TABLE public.nvrs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  model VARCHAR(255) NOT NULL, -- e.g., 'Hikvision 16CH', 'Dahua XVR'
  ip_address VARCHAR(50) NOT NULL,
  username VARCHAR(100), -- NVR Login Username
  password VARCHAR(255), -- NVR Login Password
  storage_total_tb NUMERIC(5,2),
  storage_used_tb NUMERIC(5,2),
  status VARCHAR(50) DEFAULT 'Online',
  cpu_usage_pct INTEGER,
  network_bandwidth_mbps NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Cameras Table
CREATE TABLE public.cameras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nvr_id UUID REFERENCES public.nvrs(id) ON DELETE CASCADE,
  channel_number INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL, -- e.g., 'Entrance', 'Cashier'
  is_offline BOOLEAN DEFAULT false,
  framerate INTEGER DEFAULT 30,
  resolution VARCHAR(50) DEFAULT '1080p',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Alerts/Logs Table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  nvr_id UUID REFERENCES public.nvrs(id) ON DELETE CASCADE, -- Optional, if alert is specific to NVR
  camera_id UUID REFERENCES public.cameras(id) ON DELETE CASCADE, -- Optional, if specific to Camera
  severity VARCHAR(50) NOT NULL, -- 'high', 'medium', 'low'
  issue_description TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for scaling performance with 200+ stores
CREATE INDEX idx_stores_region ON public.stores(region);
CREATE INDEX idx_nvrs_store_id ON public.nvrs(store_id);
CREATE INDEX idx_cameras_nvr_id ON public.cameras(nvr_id);
CREATE INDEX idx_alerts_store_id ON public.alerts(store_id);
CREATE INDEX idx_alerts_unresolved ON public.alerts(is_resolved) WHERE is_resolved = false;
