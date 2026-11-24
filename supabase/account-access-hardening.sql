-- Apply after the base schema and any older schema patches.
begin;

-- Conversation membership and message writes go through the authenticated API.
-- Browser clients keep member-scoped reads for chat and realtime.
revoke insert, update, delete, truncate on public.conversations, public.conversation_members, public.messages
  from public, anon, authenticated;
grant select on public.conversations, public.conversation_members, public.messages to authenticated;
grant select, insert, update, delete on public.conversations, public.conversation_members, public.messages to service_role;

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

create or replace function public.campusloop_is_conversation_member(conversation_key text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversation_members member
    where member.user_id = (select auth.uid())
      and member.conversation_id::text = conversation_key
  );
$$;

revoke execute on function public.campusloop_is_conversation_member(text) from public, anon;
grant execute on function public.campusloop_is_conversation_member(text) to authenticated;

drop policy if exists "Members can view their conversations" on public.conversations;
create policy "Members can view their conversations"
  on public.conversations for select to authenticated
  using (public.campusloop_is_conversation_member(id::text));

drop policy if exists "Members can view conversation members" on public.conversation_members;
create policy "Members can view conversation members"
  on public.conversation_members for select to authenticated
  using (public.campusloop_is_conversation_member(conversation_id::text));

drop policy if exists "Members can view messages in their conversations" on public.messages;
create policy "Members can view messages in their conversations"
  on public.messages for select to authenticated
  using (public.campusloop_is_conversation_member(conversation_id::text));

-- Older optional patches gave browser roles overly broad access to these tables.
do $$
begin
  if to_regclass('public.password_resets') is not null then
    alter table public.password_resets enable row level security;
    drop policy if exists "Service role manages password resets" on public.password_resets;
    revoke all on public.password_resets from public, anon, authenticated;
    grant select, insert, update, delete on public.password_resets to service_role;
  end if;

  if to_regclass('public.notifications') is not null then
    alter table public.notifications enable row level security;
    drop policy if exists "Service role manages all notifications" on public.notifications;
    drop policy if exists "Users can manage their own notifications" on public.notifications;
    drop policy if exists "Users can view their own notifications" on public.notifications;
    revoke all on public.notifications from public, anon, authenticated;
    grant select on public.notifications to authenticated;
    grant select, insert, update, delete on public.notifications to service_role;
    create policy "Users can view their own notifications"
      on public.notifications for select to authenticated using (auth.uid() = user_id);
  end if;

  if to_regclass('public.wanted_listings') is not null then
    alter table public.wanted_listings enable row level security;
    drop policy if exists "Authenticated users can create wanted listings" on public.wanted_listings;
    drop policy if exists "Requesters can update their own wanted listings" on public.wanted_listings;
    drop policy if exists "Requesters can delete their own wanted listings" on public.wanted_listings;
    create policy "Authenticated users can create wanted listings"
      on public.wanted_listings for insert to authenticated with check (auth.uid() = requester_id);
    create policy "Requesters can update their own wanted listings"
      on public.wanted_listings for update to authenticated
      using (auth.uid() = requester_id) with check (auth.uid() = requester_id);
    create policy "Requesters can delete their own wanted listings"
      on public.wanted_listings for delete to authenticated using (auth.uid() = requester_id);
  end if;

  if to_regclass('public.room_images') is not null then
    alter table public.room_images enable row level security;
    drop policy if exists "Room owners can manage room images" on public.room_images;
    create policy "Room owners can manage room images"
      on public.room_images for all to authenticated
      using (exists (select 1 from public.rooms where rooms.id = room_images.room_id and rooms.owner_id = auth.uid()))
      with check (exists (select 1 from public.rooms where rooms.id = room_images.room_id and rooms.owner_id = auth.uid()));
  end if;
end;
$$;

commit;
