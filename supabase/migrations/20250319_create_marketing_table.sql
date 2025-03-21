-- Create marketing campaigns table
create table if not exists marketing_campaigns (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    start_date date not null,
    duration_days integer not null,
    cost decimal(10,2) not null,
    target_audience integer not null,
    first_contacts integer default 0,
    info_sent integer default 0,
    registrations integer default 0,
    sales integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users(id) on delete cascade not null
);

-- Enable RLS
alter table marketing_campaigns enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own marketing campaigns" on marketing_campaigns;
drop policy if exists "Users can insert their own marketing campaigns" on marketing_campaigns;
drop policy if exists "Users can update their own marketing campaigns" on marketing_campaigns;
drop policy if exists "Users can delete their own marketing campaigns" on marketing_campaigns;

-- Create policies
create policy "Users can view their own marketing campaigns"
    on marketing_campaigns for select
    using (auth.uid() = user_id);

create policy "Users can insert their own marketing campaigns"
    on marketing_campaigns for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own marketing campaigns"
    on marketing_campaigns for update
    using (auth.uid() = user_id);

create policy "Users can delete their own marketing campaigns"
    on marketing_campaigns for delete
    using (auth.uid() = user_id);

-- Create function to calculate conversion rate
create or replace function calculate_campaign_conversion_rate(campaign_id uuid)
returns table (metric text, rate decimal)
language plpgsql
as $$
begin
    return query
    select 'First Contact Rate' as metric,
           case when target_audience > 0 
                then (first_contacts::decimal / target_audience::decimal) * 100
                else 0
           end as rate
    from marketing_campaigns
    where id = campaign_id
    union all
    select 'Info Sent Rate' as metric,
           case when first_contacts > 0 
                then (info_sent::decimal / first_contacts::decimal) * 100
                else 0
           end as rate
    from marketing_campaigns
    where id = campaign_id
    union all
    select 'Registration Rate' as metric,
           case when info_sent > 0 
                then (registrations::decimal / info_sent::decimal) * 100
                else 0
           end as rate
    from marketing_campaigns
    where id = campaign_id
    union all
    select 'Sales Rate' as metric,
           case when registrations > 0 
                then (sales::decimal / registrations::decimal) * 100
                else 0
           end as rate
    from marketing_campaigns
    where id = campaign_id;
end;
$$;