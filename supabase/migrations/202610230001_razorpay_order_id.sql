alter table public.orders
  add column if not exists razorpay_order_id text,
  add column if not exists razorpay_payment_id text;

create unique index if not exists orders_razorpay_order_id_idx
  on public.orders (razorpay_order_id)
  where razorpay_order_id is not null;
