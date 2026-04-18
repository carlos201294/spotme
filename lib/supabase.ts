import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://frnwoaqgzcfqblmevgrq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZybndvYXFnemNmcWJsbWV2Z3JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NzU1NzUsImV4cCI6MjA5MTU1MTU3NX0.8S3_R4kePNDJqHxcUj42cQVT7T_z2cIjnbjSFhExRvU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);