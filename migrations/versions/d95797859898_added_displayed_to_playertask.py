"""Added displayed to PlayerTask

Revision ID: d95797859898
Revises: cc006818849a
Create Date: 2025-03-06 20:33:09.302437

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd95797859898'
down_revision = 'cc006818849a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('player_tasks', schema=None) as batch_op:
        batch_op.add_column(sa.Column('displayed', sa.Boolean(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('player_tasks', schema=None) as batch_op:
        batch_op.drop_column('displayed')

    # ### end Alembic commands ###
