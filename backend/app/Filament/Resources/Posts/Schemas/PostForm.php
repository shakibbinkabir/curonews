<?php

namespace App\Filament\Resources\Posts\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Group;
use Filament\Schemas\Schema;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class PostForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Group::make()
                    ->schema([
                        Section::make('Post Content')
                            ->schema([
                                TextInput::make('title')
                                    ->required()
                                    ->maxLength(255)
                                    ->live(onBlur: true)
                                    ->afterStateUpdated(function ($set, ?string $state) {
                                        $set('slug', Str::slug($state));
                                        $set('meta_title', $state);
                                    }),

                                TextInput::make('slug')
                                    ->required()
                                    ->maxLength(255)
                                    ->unique(ignoreRecord: true),

                                RichEditor::make('content')
                                    ->required()
                                    ->columnSpanFull()
                                    ->fileAttachmentsDisk('public')
                                    ->fileAttachmentsDirectory('post-attachments'),

                                Textarea::make('excerpt')
                                    ->rows(3)
                                    ->maxLength(500)
                                    ->columnSpanFull()
                                    ->helperText('Leave empty to auto-generate from content'),
                            ])
                            ->columns(2),

                        Section::make('Source Information')
                            ->schema([
                                TextInput::make('source_name')
                                    ->maxLength(255)
                                    ->label('Source Name'),

                                TextInput::make('source_url')
                                    ->url()
                                    ->maxLength(500)
                                    ->label('Source URL'),
                            ])
                            ->columns(2)
                            ->collapsed(),

                        Section::make('SEO')
                            ->schema([
                                TextInput::make('meta_title')
                                    ->maxLength(255)
                                    ->label('Meta Title'),

                                Textarea::make('meta_description')
                                    ->rows(2)
                                    ->maxLength(500)
                                    ->label('Meta Description'),
                            ])
                            ->columns(1)
                            ->collapsed(),
                    ])
                    ->columnSpan(['lg' => 2]),

                Group::make()
                    ->schema([
                        Section::make('Status')
                            ->schema([
                                Select::make('status')
                                    ->options([
                                        'draft' => 'Draft',
                                        'pending' => 'Pending Review',
                                        'published' => 'Published',
                                        'rejected' => 'Rejected',
                                    ])
                                    ->default('draft')
                                    ->required()
                                    ->native(false),

                                DateTimePicker::make('published_at')
                                    ->label('Publish Date')
                                    ->native(false),

                                Textarea::make('rejection_reason')
                                    ->rows(2)
                                    ->label('Rejection Reason')
                                    ->visible(fn ($get) => $get('status') === 'rejected'),
                            ]),

                        Section::make('Classification')
                            ->schema([
                                Select::make('category_id')
                                    ->relationship('category', 'name')
                                    ->required()
                                    ->searchable()
                                    ->preload()
                                    ->native(false),

                                Select::make('tags')
                                    ->relationship('tags', 'name')
                                    ->multiple()
                                    ->searchable()
                                    ->preload()
                                    ->createOptionForm([
                                        TextInput::make('name')
                                            ->required()
                                            ->maxLength(100),
                                        TextInput::make('slug')
                                            ->required()
                                            ->maxLength(100),
                                    ]),
                            ]),

                        Section::make('Featured Image')
                            ->schema([
                                FileUpload::make('image_original')
                                    ->image()
                                    ->disk('public')
                                    ->directory('posts/original')
                                    ->visibility('public')
                                    ->imageResizeMode('contain')
                                    ->imageResizeTargetWidth(2000)
                                    ->imageResizeTargetHeight(2000)
                                    ->maxSize(10240) // 10MB
                                    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                                    ->label('Original Image')
                                    ->helperText('Upload image (min 400x400px). A 9:16 processed version will be generated automatically.'),

                                Placeholder::make('image_processed_preview')
                                    ->label('Processed Image (9:16)')
                                    ->content(function ($record) {
                                        if (!$record?->image_processed) {
                                            return 'Processing... (refresh page after a few seconds)';
                                        }
                                        return new \Illuminate\Support\HtmlString(
                                            '<img src="' . $record->image_processed_url . '" class="max-w-xs rounded shadow" />'
                                        );
                                    })
                                    ->visible(fn ($record) => $record?->image_original),
                            ]),
                    ])
                    ->columnSpan(['lg' => 1]),
            ])
            ->columns(3);
    }
}
