ALTER TABLE public.community_collectives ADD COLUMN IF NOT EXISTS membership_count INTEGER DEFAULT 0;

UPDATE public.community_collectives SET membership_count = 40, meetings_conducted = 4, participants_count = 117 WHERE sno = '1';
UPDATE public.community_collectives SET membership_count = 19, meetings_conducted = 3, participants_count = 38 WHERE sno = '2';
UPDATE public.community_collectives SET membership_count = 12, meetings_conducted = 2, participants_count = 16 WHERE sno = '3';
UPDATE public.community_collectives SET membership_count = 22, meetings_conducted = 3, participants_count = 36 WHERE sno = '4';
UPDATE public.community_collectives SET membership_count = 15, meetings_conducted = 1, participants_count = 21 WHERE sno = '5';
UPDATE public.community_collectives SET membership_count = 27, meetings_conducted = 3, participants_count = 70 WHERE sno = '6';
UPDATE public.community_collectives SET membership_count = 40, meetings_conducted = 4, participants_count = 74 WHERE sno = '7';
UPDATE public.community_collectives SET membership_count = 30, meetings_conducted = 1, participants_count = 20 WHERE sno = '8';
UPDATE public.community_collectives SET membership_count = 20, meetings_conducted = 1, participants_count = 20 WHERE sno = '9';
UPDATE public.community_collectives SET membership_count = 27, meetings_conducted = 3, participants_count = 60 WHERE sno = '10';
UPDATE public.community_collectives SET membership_count = 24, meetings_conducted = 3, participants_count = 47 WHERE sno = '11';
