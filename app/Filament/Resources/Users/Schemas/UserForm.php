<?php

namespace App\Filament\Resources\Users\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('User Information')
                    ->schema([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255),
                        TextInput::make('email')
                            ->label('Email address')
                            ->email()
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        TextInput::make('password')
                            ->password()
                            ->required(fn (string $operation): bool => $operation === 'create')
                            ->dehydrated(fn (?string $state): bool => filled($state))
                            ->dehydrateStateUsing(fn (string $state): string => bcrypt($state))
                            ->maxLength(255)
                            ->helperText('Leave empty to keep current password'),
                        Select::make('role')
                            ->options([
                                'guest' => 'Guest',
                                'user' => 'User',
                                'sourcer' => 'Sourcer',
                                'admin' => 'Admin',
                            ])
                            ->default('user')
                            ->required(),
                    ])
                    ->columns(2),
                Section::make('Profile')
                    ->schema([
                        FileUpload::make('avatar')
                            ->image()
                            ->directory('avatars')
                            ->nullable(),
                        TextInput::make('telegram_chat_id')
                            ->label('Telegram Chat ID')
                            ->nullable()
                            ->maxLength(255),
                    ])
                    ->columns(2)
                    ->collapsible(),
            ]);
    }
}
