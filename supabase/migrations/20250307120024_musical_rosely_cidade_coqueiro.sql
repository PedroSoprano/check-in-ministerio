-- Rosely na Cidade também é Coqueiro (não a peça "Cidade")
delete from public.cast_assignments
where participant_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0008'
  and piece_id = 'dddddddd-dddd-dddd-dddd-dddddddd0001';

insert into public.cast_assignments (piece_id, participant_id, entrance_side, note)
values (
  'dddddddd-dddd-dddd-dddd-dddddddd0002',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeee0008',
  'arvore',
  null
)
on conflict (piece_id, participant_id) do update
  set entrance_side = excluded.entrance_side;
