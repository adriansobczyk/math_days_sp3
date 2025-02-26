"""Added color and shape fields to Player model

Revision ID: d888d055c621
Revises: 
Create Date: 2025-02-26 21:23:00.427262

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd888d055c621'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('players', schema=None) as batch_op:
        batch_op.add_column(sa.Column('color', sa.String(length=20), nullable=False))
        batch_op.add_column(sa.Column('shape', sa.String(length=20), nullable=False))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('players', schema=None) as batch_op:
        batch_op.drop_column('shape')
        batch_op.drop_column('color')

    # ### end Alembic commands ###
