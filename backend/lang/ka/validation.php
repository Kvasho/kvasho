<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | Georgian versions of the default validation messages. Field names are
    | quoted („…") so the sentence reads naturally whatever the field is.
    |
    */

    'accepted' => 'ველი „:attribute" უნდა იყოს მონიშნული.',
    'accepted_if' => 'ველი „:attribute" უნდა იყოს მონიშნული, როცა „:other" არის :value.',
    'active_url' => 'ველი „:attribute" უნდა იყოს სწორი URL.',
    'after' => 'ველი „:attribute" უნდა იყოს :date-ის შემდეგ.',
    'after_or_equal' => 'ველი „:attribute" უნდა იყოს :date ან მის შემდეგ.',
    'alpha' => 'ველი „:attribute" უნდა შეიცავდეს მხოლოდ ასოებს.',
    'alpha_dash' => 'ველი „:attribute" უნდა შეიცავდეს მხოლოდ ასოებს, ციფრებს, ტირეებს და ქვედა ტირეებს.',
    'alpha_num' => 'ველი „:attribute" უნდა შეიცავდეს მხოლოდ ასოებს და ციფრებს.',
    'any_of' => 'ველი „:attribute" არასწორია.',
    'array' => 'ველი „:attribute" უნდა იყოს მასივი.',
    'array_keys' => 'ველი „:attribute" უნდა შეიცავდეს მხოლოდ შემდეგ გასაღებებს: :values.',
    'ascii' => 'ველი „:attribute" უნდა შეიცავდეს მხოლოდ ლათინურ ასოებს, ციფრებს და სიმბოლოებს.',
    'base64' => 'ველი „:attribute" უნდა იყოს სწორი Base64 სტრიქონი.',
    'before' => 'ველი „:attribute" უნდა იყოს :date-მდე.',
    'before_or_equal' => 'ველი „:attribute" უნდა იყოს :date ან მანამდე.',
    'between' => [
        'array' => 'ველი „:attribute" უნდა შეიცავდეს :min-დან :max-მდე ელემენტს.',
        'file' => 'ველი „:attribute" უნდა იყოს :min-დან :max კილობაიტამდე.',
        'numeric' => 'ველი „:attribute" უნდა იყოს :min-დან :max-მდე.',
        'string' => 'ველი „:attribute" უნდა შეიცავდეს :min-დან :max სიმბოლომდე.',
    ],
    'boolean' => 'ველი „:attribute" უნდა იყოს true ან false.',
    'can' => 'ველი „:attribute" შეიცავს დაუშვებელ მნიშვნელობას.',
    'confirmed' => 'ველის „:attribute" დადასტურება არ ემთხვევა.',
    'contains' => 'ველს „:attribute" აკლია სავალდებულო მნიშვნელობა.',
    'current_password' => 'პაროლი არასწორია.',
    'date' => 'ველი „:attribute" უნდა იყოს სწორი თარიღი.',
    'date_equals' => 'ველი „:attribute" უნდა იყოს :date.',
    'date_format' => 'ველი „:attribute" უნდა იყოს ფორმატით :format.',
    'decimal' => 'ველს „:attribute" უნდა ჰქონდეს :decimal ათწილადი ნიშანი.',
    'declined' => 'ველი „:attribute" უნდა იყოს უარყოფილი.',
    'declined_if' => 'ველი „:attribute" უნდა იყოს უარყოფილი, როცა „:other" არის :value.',
    'different' => 'ველები „:attribute" და „:other" უნდა განსხვავდებოდეს.',
    'digits' => 'ველი „:attribute" უნდა შედგებოდეს :digits ციფრისგან.',
    'digits_between' => 'ველი „:attribute" უნდა შედგებოდეს :min-დან :max ციფრამდე.',
    'dimensions' => 'ველში „:attribute" სურათის ზომები არასწორია.',
    'distinct' => 'ველში „:attribute" მნიშვნელობა მეორდება.',
    'doesnt_contain' => 'ველი „:attribute" არ უნდა შეიცავდეს: :values.',
    'doesnt_end_with' => 'ველი „:attribute" არ უნდა მთავრდებოდეს შემდეგით: :values.',
    'doesnt_start_with' => 'ველი „:attribute" არ უნდა იწყებოდეს შემდეგით: :values.',
    'email' => 'ველი „:attribute" უნდა იყოს სწორი ელფოსტის მისამართი.',
    'encoding' => 'ველი „:attribute" უნდა იყოს კოდირებით :encoding.',
    'ends_with' => 'ველი „:attribute" უნდა მთავრდებოდეს შემდეგიდან ერთ-ერთით: :values.',
    'enum' => 'არჩეული „:attribute" არასწორია.',
    'exists' => 'არჩეული „:attribute" არასწორია.',
    'extensions' => 'ველს „:attribute" უნდა ჰქონდეს ერთ-ერთი გაფართოება: :values.',
    'file' => 'ველი „:attribute" უნდა იყოს ფაილი.',
    'filled' => 'ველი „:attribute" არ უნდა იყოს ცარიელი.',
    'gt' => [
        'array' => 'ველი „:attribute" უნდა შეიცავდეს :value-ზე მეტ ელემენტს.',
        'file' => 'ველი „:attribute" უნდა იყოს :value კილობაიტზე მეტი.',
        'numeric' => 'ველი „:attribute" უნდა იყოს :value-ზე მეტი.',
        'string' => 'ველი „:attribute" უნდა შეიცავდეს :value სიმბოლოზე მეტს.',
    ],
    'gte' => [
        'array' => 'ველი „:attribute" უნდა შეიცავდეს :value ან მეტ ელემენტს.',
        'file' => 'ველი „:attribute" უნდა იყოს :value კილობაიტი ან მეტი.',
        'numeric' => 'ველი „:attribute" უნდა იყოს :value ან მეტი.',
        'string' => 'ველი „:attribute" უნდა შეიცავდეს :value ან მეტ სიმბოლოს.',
    ],
    'hex_color' => 'ველი „:attribute" უნდა იყოს სწორი თექვსმეტობითი ფერი.',
    'image' => 'ველი „:attribute" უნდა იყოს სურათი.',
    'in' => 'არჩეული „:attribute" არასწორია.',
    'in_array' => 'ველი „:attribute" უნდა არსებობდეს „:other"-ში.',
    'in_array_keys' => 'ველი „:attribute" უნდა შეიცავდეს ერთ-ერთ გასაღებს: :values.',
    'integer' => 'ველი „:attribute" უნდა იყოს მთელი რიცხვი.',
    'ip' => 'ველი „:attribute" უნდა იყოს სწორი IP მისამართი.',
    'ipv4' => 'ველი „:attribute" უნდა იყოს სწორი IPv4 მისამართი.',
    'ipv6' => 'ველი „:attribute" უნდა იყოს სწორი IPv6 მისამართი.',
    'json' => 'ველი „:attribute" უნდა იყოს სწორი JSON სტრიქონი.',
    'list' => 'ველი „:attribute" უნდა იყოს სია.',
    'lowercase' => 'ველი „:attribute" უნდა იყოს პატარა ასოებით.',
    'lt' => [
        'array' => 'ველი „:attribute" უნდა შეიცავდეს :value-ზე ნაკლებ ელემენტს.',
        'file' => 'ველი „:attribute" უნდა იყოს :value კილობაიტზე ნაკლები.',
        'numeric' => 'ველი „:attribute" უნდა იყოს :value-ზე ნაკლები.',
        'string' => 'ველი „:attribute" უნდა შეიცავდეს :value სიმბოლოზე ნაკლებს.',
    ],
    'lte' => [
        'array' => 'ველი „:attribute" არ უნდა შეიცავდეს :value-ზე მეტ ელემენტს.',
        'file' => 'ველი „:attribute" უნდა იყოს :value კილობაიტი ან ნაკლები.',
        'numeric' => 'ველი „:attribute" უნდა იყოს :value ან ნაკლები.',
        'string' => 'ველი „:attribute" უნდა შეიცავდეს :value ან ნაკლებ სიმბოლოს.',
    ],
    'mac_address' => 'ველი „:attribute" უნდა იყოს სწორი MAC მისამართი.',
    'max' => [
        'array' => 'ველი „:attribute" არ უნდა შეიცავდეს :max-ზე მეტ ელემენტს.',
        'file' => 'ველი „:attribute" არ უნდა აღემატებოდეს :max კილობაიტს.',
        'numeric' => 'ველი „:attribute" არ უნდა აღემატებოდეს :max-ს.',
        'string' => 'ველი „:attribute" არ უნდა აღემატებოდეს :max სიმბოლოს.',
    ],
    'max_digits' => 'ველი „:attribute" არ უნდა შეიცავდეს :max ციფრზე მეტს.',
    'mimes' => 'ველი „:attribute" უნდა იყოს ფაილი ტიპით: :values.',
    'mimetypes' => 'ველი „:attribute" უნდა იყოს ფაილი ტიპით: :values.',
    'min' => [
        'array' => 'ველი „:attribute" უნდა შეიცავდეს მინიმუმ :min ელემენტს.',
        'file' => 'ველი „:attribute" უნდა იყოს მინიმუმ :min კილობაიტი.',
        'numeric' => 'ველი „:attribute" უნდა იყოს მინიმუმ :min.',
        'string' => 'ველი „:attribute" უნდა შეიცავდეს მინიმუმ :min სიმბოლოს.',
    ],
    'min_digits' => 'ველი „:attribute" უნდა შეიცავდეს მინიმუმ :min ციფრს.',
    'missing' => 'ველი „:attribute" არ უნდა იყოს გადმოცემული.',
    'missing_if' => 'ველი „:attribute" არ უნდა იყოს გადმოცემული, როცა „:other" არის :value.',
    'missing_unless' => 'ველი „:attribute" არ უნდა იყოს გადმოცემული, თუ „:other" არ არის :value.',
    'missing_with' => 'ველი „:attribute" არ უნდა იყოს გადმოცემული, როცა :values მითითებულია.',
    'missing_with_all' => 'ველი „:attribute" არ უნდა იყოს გადმოცემული, როცა :values მითითებულია.',
    'multiple_of' => 'ველი „:attribute" უნდა იყოს :value-ის ჯერადი.',
    'not_in' => 'არჩეული „:attribute" არასწორია.',
    'not_regex' => 'ველის „:attribute" ფორმატი არასწორია.',
    'numeric' => 'ველი „:attribute" უნდა იყოს რიცხვი.',
    'password' => [
        'letters' => 'ველი „:attribute" უნდა შეიცავდეს მინიმუმ ერთ ასოს.',
        'mixed' => 'ველი „:attribute" უნდა შეიცავდეს მინიმუმ ერთ დიდ და ერთ პატარა ასოს.',
        'numbers' => 'ველი „:attribute" უნდა შეიცავდეს მინიმუმ ერთ ციფრს.',
        'symbols' => 'ველი „:attribute" უნდა შეიცავდეს მინიმუმ ერთ სიმბოლოს.',
        'uncompromised' => 'ეს „:attribute" მონაცემთა გაჟონვაში გამოჩნდა. გთხოვთ, აირჩიოთ სხვა.',
    ],
    'present' => 'ველი „:attribute" უნდა იყოს გადმოცემული.',
    'present_if' => 'ველი „:attribute" უნდა იყოს გადმოცემული, როცა „:other" არის :value.',
    'present_unless' => 'ველი „:attribute" უნდა იყოს გადმოცემული, თუ „:other" არ არის :value.',
    'present_with' => 'ველი „:attribute" უნდა იყოს გადმოცემული, როცა :values მითითებულია.',
    'present_with_all' => 'ველი „:attribute" უნდა იყოს გადმოცემული, როცა :values მითითებულია.',
    'prohibited' => 'ველი „:attribute" აკრძალულია.',
    'prohibited_if' => 'ველი „:attribute" აკრძალულია, როცა „:other" არის :value.',
    'prohibited_if_accepted' => 'ველი „:attribute" აკრძალულია, როცა „:other" მონიშნულია.',
    'prohibited_if_declined' => 'ველი „:attribute" აკრძალულია, როცა „:other" უარყოფილია.',
    'prohibited_unless' => 'ველი „:attribute" აკრძალულია, თუ „:other" არ არის :values-ში.',
    'prohibits' => 'ველი „:attribute" კრძალავს „:other"-ის მითითებას.',
    'regex' => 'ველის „:attribute" ფორმატი არასწორია.',
    'required' => 'ველი „:attribute" სავალდებულოა.',
    'required_array_keys' => 'ველი „:attribute" უნდა შეიცავდეს ჩანაწერებს: :values.',
    'required_if' => 'ველი „:attribute" სავალდებულოა, როცა „:other" არის :value.',
    'required_if_accepted' => 'ველი „:attribute" სავალდებულოა, როცა „:other" მონიშნულია.',
    'required_if_declined' => 'ველი „:attribute" სავალდებულოა, როცა „:other" უარყოფილია.',
    'required_unless' => 'ველი „:attribute" სავალდებულოა, თუ „:other" არ არის :values-ში.',
    'required_with' => 'ველი „:attribute" სავალდებულოა, როცა :values მითითებულია.',
    'required_with_all' => 'ველი „:attribute" სავალდებულოა, როცა :values მითითებულია.',
    'required_without' => 'ველი „:attribute" სავალდებულოა, როცა :values არ არის მითითებული.',
    'required_without_all' => 'ველი „:attribute" სავალდებულოა, როცა არცერთი :values არ არის მითითებული.',
    'same' => 'ველი „:attribute" უნდა ემთხვეოდეს „:other"-ს.',
    'size' => [
        'array' => 'ველი „:attribute" უნდა შეიცავდეს :size ელემენტს.',
        'file' => 'ველი „:attribute" უნდა იყოს :size კილობაიტი.',
        'numeric' => 'ველი „:attribute" უნდა იყოს :size.',
        'string' => 'ველი „:attribute" უნდა შეიცავდეს :size სიმბოლოს.',
    ],
    'starts_with' => 'ველი „:attribute" უნდა იწყებოდეს შემდეგიდან ერთ-ერთით: :values.',
    'string' => 'ველი „:attribute" უნდა იყოს ტექსტი.',
    'timezone' => 'ველი „:attribute" უნდა იყოს სწორი დროის სარტყელი.',
    'unique' => 'ასეთი „:attribute" უკვე დაკავებულია.',
    'uploaded' => '„:attribute" ვერ აიტვირთა.',
    'uppercase' => 'ველი „:attribute" უნდა იყოს დიდი ასოებით.',
    'url' => 'ველი „:attribute" უნდა იყოს სწორი URL.',
    'ulid' => 'ველი „:attribute" უნდა იყოს სწორი ULID.',
    'uuid' => 'ველი „:attribute" უნდა იყოს სწორი UUID.',

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Language Lines
    |--------------------------------------------------------------------------
    */

    'custom' => [],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    |
    | Georgian names of the request fields used across the API.
    |
    */

    'attributes' => [
        'name' => 'სახელი',
        'email' => 'ელფოსტა',
        'password' => 'პაროლი',
        'company_name' => 'კომპანიის სახელი',
        'tax_id' => 'საიდენტიფიკაციო კოდი',
        'address' => 'მისამართი',
        'phone' => 'ტელეფონი',
        'bank_account' => 'საბანკო ანგარიში',
        'currency' => 'ვალუტა',
        'invoice_prefix' => 'ინვოისის პრეფიქსი',
        'logo' => 'ლოგო',
        'search' => 'ძებნა',
        'round' => 'რაუნდი',
        'lat' => 'განედი',
        'lng' => 'გრძედი',
    ],

];
