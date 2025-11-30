use anchor_lang::prelude::*;
use anchor_spl::{
    token_interface::TokenInterface,
    token_2022,
};
use solana_program::{program::invoke, system_instruction};

// DOUBLE CHECK: Ensure this ID matches your Playground ID!
declare_id!("HDDd6cLppUWjNVHubcthD2MydeyitNQyKKPekuCfNtWQ"); 

#[program]
pub mod berry_program {
    use super::*;

    pub fn initialize_berry_token(
        ctx: Context<InitializeBerry>, 
        fee_basis_points: u16, // 100 = 1%
        max_fee: u64,          // Max tokens to tax
    ) -> Result<()> {
        
        // 1. Manually Create the Account
        // We do this to ensure we can add extensions BEFORE initializing the mint
        let space: u64 = 400; // Enough space for Mint + Extensions
        let lamports = ctx.accounts.rent.minimum_balance(space as usize);

        invoke(
            &system_instruction::create_account(
                &ctx.accounts.authority.key(),
                &ctx.accounts.mint.key(),
                lamports,
                space,
                &ctx.accounts.token_program.key(), // Owner MUST be Token-2022
            ),
            &[
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // 2. Initialize the Transfer Fee Extension
        let authority_key = ctx.accounts.authority.key(); 
        
        let ix = token_2022::spl_token_2022::extension::transfer_fee::instruction::initialize_transfer_fee_config(
            &ctx.accounts.token_program.key(),
            &ctx.accounts.mint.key(),
            Some(&authority_key),
            Some(&authority_key),
            fee_basis_points,
            max_fee,
        )?;

        invoke(
            &ix,
            &[ctx.accounts.mint.to_account_info()],
        )?;

        // 3. Initialize the Mint (Standard Logic)
        token_2022::initialize_mint(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token_2022::InitializeMint {
                    mint: ctx.accounts.mint.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
            ),
            9, // Decimals
            &ctx.accounts.authority.key(),
            None, 
        )?;

        msg!("BERRY Token Initialized with 1% Tax Strategy");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeBerry<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    // CHANGED: "Signer" type means "Just a keypair". 
    // We stopped using "init" so Anchor doesn't mess up our order.
    #[account(mut)] 
    pub mint: Signer<'info>, 

    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
}